
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings, Loader2 } from 'lucide-react';
import { CustomFieldDialog } from './CustomFieldDialog';
import { CustomFieldDefinition, CustomFieldFormValue, CustomFieldSet } from '@/types/customField';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CustomFieldsManagerProps {
  entityType: 'contact' | 'matter' | 'task';
  entityId?: string;
  values: CustomFieldFormValue[];
  onChange: (values: CustomFieldFormValue[]) => void;
}

export function CustomFieldsManager({
  entityType,
  entityId,
  values,
  onChange
}: CustomFieldsManagerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch available custom fields and field sets
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get organization ID
        const { data: profileData } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileData?.organization_id) {
          throw new Error("Organization not found");
        }

        // Fetch field sets
        const { data: fieldSetData, error: fieldSetError } = await supabase
          .from('custom_field_sets')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', entityType)
          .order('position');
        
        if (fieldSetError) throw fieldSetError;
        setFieldSets(fieldSetData || []);

        // Fetch fields
        const { data, error } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('entity_type', entityType)
          .eq('organization_id', profileData.organization_id)
          .order('field_set')
          .order('position');
          
        if (error) throw error;
        
        setFields(data || []);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        toast({
          title: "Error",
          description: "Failed to load custom fields.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomFields();
  }, [user, entityType]);

  // If we have an entity ID, fetch existing values
  useEffect(() => {
    const fetchExistingValues = async () => {
      if (!user || !entityId) return;
      
      try {
        const { data, error } = await supabase
          .from('custom_field_values')
          .select(`
            id,
            definition_id,
            value,
            definition:custom_field_definitions(*)
          `)
          .eq('entity_id', entityId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedValues = data.map(item => ({
            definition_id: item.definition_id,
            value: item.value
          }));
          
          onChange(formattedValues);
        }
      } catch (error) {
        console.error('Error fetching custom field values:', error);
      }
    };
    
    if (entityId) {
      fetchExistingValues();
    }
  }, [user, entityId]);

  const handleFieldChange = (definitionId: string, value: string | null) => {
    // Check if this field is already in values
    const existingIndex = values.findIndex(v => v.definition_id === definitionId);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedValues = [...values];
      updatedValues[existingIndex] = { ...updatedValues[existingIndex], value };
      onChange(updatedValues);
    } else {
      // Add new
      onChange([...values, { definition_id: definitionId, value }]);
    }
  };

  const getFieldValue = (definitionId: string): string | null => {
    const field = values.find(v => v.definition_id === definitionId);
    return field ? field.value : null;
  };

  // Group fields by field set
  const getFieldsBySet = () => {
    const fieldsBySet: Record<string, CustomFieldDefinition[]> = {};
    const unassignedFields: CustomFieldDefinition[] = [];
    
    // Initialize with empty arrays for each field set
    fieldSets.forEach(set => {
      fieldsBySet[set.id] = [];
    });
    
    // Add fields to their respective sets
    fields.forEach(field => {
      if (field.field_set && fieldsBySet[field.field_set]) {
        fieldsBySet[field.field_set].push(field);
      } else {
        unassignedFields.push(field);
      }
    });
    
    // Add unassigned fields if any
    if (unassignedFields.length > 0) {
      fieldsBySet['unassigned'] = unassignedFields;
    }
    
    return fieldsBySet;
  };

  const renderFieldInput = (field: CustomFieldDefinition) => {
    const currentValue = getFieldValue(field.id);
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.default_value || ''}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.default_value || ''}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={currentValue || ''} 
            onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={currentValue === 'true'}
              onCheckedChange={(checked) => 
                handleFieldChange(field.id, checked ? 'true' : 'false')
              }
            />
            <Label>Enabled</Label>
          </div>
        );
        
      case 'email':
        return (
          <Input
            type="email"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.default_value || 'email@example.com'}
          />
        );
        
      case 'phone':
        return (
          <Input
            type="tel"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.default_value || '+1 (555) 123-4567'}
          />
        );
        
      case 'url':
        return (
          <Input
            type="url"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.default_value || 'https://example.com'}
          />
        );
        
      default:
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const fieldsBySet = getFieldsBySet();
  const hasAnyFields = Object.values(fieldsBySet).some(fields => fields.length > 0);

  return (
    <div className="space-y-4">
      {hasAnyFields ? (
        <Accordion type="single" collapsible className="w-full">
          {fieldSets.map(fieldSet => {
            const setFields = fieldsBySet[fieldSet.id] || [];
            if (setFields.length === 0) return null;
            
            return (
              <AccordionItem value={fieldSet.id} key={fieldSet.id}>
                <AccordionTrigger className="text-md font-medium">
                  {fieldSet.name} ({setFields.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {setFields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <Label>
                          {field.name}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderFieldInput(field)}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          
          {fieldsBySet['unassigned'] && fieldsBySet['unassigned'].length > 0 && (
            <AccordionItem value="unassigned">
              <AccordionTrigger className="text-md font-medium">
                General Fields ({fieldsBySet['unassigned'].length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {fieldsBySet['unassigned'].map((field) => (
                    <div key={field.id} className="space-y-1">
                      <Label>
                        {field.name}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderFieldInput(field)}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      ) : (
        <div className="text-center p-4 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500 mb-2">No custom fields defined yet</p>
        </div>
      )}
      
      <div className="flex justify-between pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setDialogOpen(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> 
          Add New Custom Field
        </Button>
      </div>
      
      <CustomFieldDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        entityType={entityType}
        onSuccess={() => {
          // Refresh the fields list and field sets
          setFields([]);
          setFieldSets([]);
          setLoading(true);
          
          // Fetch organization ID first
          supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user?.id)
            .maybeSingle()
            .then(({ data: profileData }) => {
              if (profileData?.organization_id) {
                // Fetch field sets
                supabase
                  .from('custom_field_sets')
                  .select('*')
                  .eq('organization_id', profileData.organization_id)
                  .eq('entity_type', entityType)
                  .order('position')
                  .then(({ data, error }) => {
                    if (!error && data) {
                      setFieldSets(data);
                    }
                  });
                
                // Fetch fields
                supabase
                  .from('custom_field_definitions')
                  .select('*')
                  .eq('entity_type', entityType)
                  .eq('organization_id', profileData.organization_id)
                  .order('field_set')
                  .order('position')
                  .then(({ data, error }) => {
                    setLoading(false);
                    if (!error && data) {
                      setFields(data);
                    }
                  });
              }
            });
        }}
      />
    </div>
  );
}
