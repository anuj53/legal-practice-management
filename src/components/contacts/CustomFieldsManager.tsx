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
import { Plus, Settings, Loader2, PlusCircle } from 'lucide-react';
import { CustomFieldDialog } from './CustomFieldDialog';
import { ContactCustomFieldSelector } from './ContactCustomFieldSelector';
import { 
  CustomFieldDefinition, 
  CustomFieldFormValue, 
  CustomFieldSet,
  mapToCustomFieldDefinition,
  mapToCustomFieldSet 
} from '@/types/customField';
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
  const [selectorOpen, setSelectorOpen] = useState(false);
  
  // Fetch available custom fields and field sets for this entity
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!user || !entityId) return;
      
      try {
        setLoading(true);
        
        // Get user's organization ID
        const { data: profileData } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!profileData?.organization_id) {
          setLoading(false);
          return;
        }
        
        const organizationId = profileData.organization_id;
        
        if (entityType === 'contact') {
          // For contacts, we need to fetch the assigned field sets and individual fields using RPC functions
          
          // Get assigned field sets for this contact
          const { data: assignedSetsData, error: assignedSetsError } = await supabase
            .rpc('get_contact_field_sets_with_details', { contact_id_param: entityId });
            
          if (assignedSetsError) {
            console.error('Error fetching assigned field sets:', assignedSetsError);
            
            // Fallback if RPC doesn't exist yet
            const { data: rawSetAssignments } = await supabase
              .from('contact_field_set_assignments')
              .select(`
                field_set_id
              `)
              .eq('contact_id', entityId);
              
            const fieldSetIds = rawSetAssignments?.map(item => item.field_set_id) || [];
            
            // Fetch fields for those field sets
            if (fieldSetIds.length > 0) {
              // Fetch the field sets with their fields
              const updatedSets = [];
              
              for (const setId of fieldSetIds) {
                // Get the field set details
                const { data: setData } = await supabase
                  .from('custom_field_sets')
                  .select('*')
                  .eq('id', setId)
                  .single();
                  
                if (setData) {
                  // Get fields for this set
                  const { data: fieldsInSetData } = await supabase
                    .from('custom_field_definitions')
                    .select('*')
                    .eq('field_set', setId)
                    .order('position');
                    
                  const mappedSet = mapToCustomFieldSet(setData);
                  mappedSet.fields = (fieldsInSetData || []).map(mapToCustomFieldDefinition);
                  
                  updatedSets.push(mappedSet);
                }
              }
              
              setFieldSets(updatedSets);
            } else {
              setFieldSets([]);
            }
          } else {
            // If RPC exists and returned data, use it
            const mappedSets = (assignedSetsData || []).map(setData => {
              const fieldSet = mapToCustomFieldSet({
                id: setData.id,
                name: setData.name,
                organization_id: setData.organization_id,
                entity_type: setData.entity_type,
                position: setData.position,
                created_at: setData.created_at,
                updated_at: setData.updated_at
              });
              
              // Add fields if they were included in the RPC response
              if (setData.fields) {
                fieldSet.fields = setData.fields.map(mapToCustomFieldDefinition);
              }
              
              return fieldSet;
            });
            
            setFieldSets(mappedSets);
          }
          
          // Get individually assigned fields (not in sets) using RPC
          const { data: assignedFieldsData, error: assignedFieldsError } = await supabase
            .rpc('get_contact_individual_fields', { contact_id_param: entityId });
            
          if (assignedFieldsError) {
            console.error('Error fetching assigned fields:', assignedFieldsError);
            
            // Fallback if RPC doesn't exist yet
            const { data: rawFieldAssignments } = await supabase
              .from('contact_field_assignments')
              .select(`
                field_id
              `)
              .eq('contact_id', entityId);
              
            const fieldIds = rawFieldAssignments?.map(item => item.field_id) || [];
            const fetchedFields = [];
            
            // Fetch each field individually
            for (const fieldId of fieldIds) {
              const { data: fieldData } = await supabase
                .from('custom_field_definitions')
                .select('*')
                .eq('id', fieldId)
                .single();
                
              if (fieldData) {
                fetchedFields.push(mapToCustomFieldDefinition(fieldData));
              }
            }
            
            setFields(fetchedFields);
          } else {
            // If RPC exists and returned data, use it
            setFields((assignedFieldsData || []).map(mapToCustomFieldDefinition));
          }
        } else {
          // For other entity types, we fetch all fields as before
          
          // Fetch field sets first using custom_field_sets table
          const { data: setsData, error: setsError } = await supabase
            .from('custom_field_sets')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('entity_type', entityType)
            .order('position');
          
          if (setsError) throw setsError;
          
          const sets = (setsData || []).map(mapToCustomFieldSet);
          setFieldSets(sets);
          
          // Fetch fields for each set
          const updatedSets = [...sets];
          
          for (const [index, set] of updatedSets.entries()) {
            const { data: fieldsInSetData, error: fieldsInSetError } = await supabase
              .from('custom_field_definitions')
              .select('*')
              .eq('organization_id', organizationId)
              .eq('field_set', set.id)
              .order('position');
            
            if (fieldsInSetError) throw fieldsInSetError;
            
            updatedSets[index] = {
              ...set,
              fields: (fieldsInSetData || []).map(mapToCustomFieldDefinition)
            };
          }
          
          setFieldSets(updatedSets);
          
          // Fetch standalone fields (fields with no set)
          const { data: standaloneFieldsData, error: standaloneFieldsError } = await supabase
            .from('custom_field_definitions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('entity_type', entityType)
            .is('field_set', null)
            .order('position');
          
          if (standaloneFieldsError) throw standaloneFieldsError;
          
          const mappedFields = (standaloneFieldsData || []).map(mapToCustomFieldDefinition);
          setFields(mappedFields);
        }
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
  }, [user, entityType, entityId]);

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

  const handleRefreshFields = async () => {
    if (!user) return;
    
    setLoading(true);
    setFields([]);
    setFieldSets([]);
    
    try {
      // Get user's organization ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .maybeSingle();
        
      if (!profileData?.organization_id) {
        setLoading(false);
        return;
      }
      
      const organizationId = profileData.organization_id;
      
      if (entityType === 'contact' && entityId) {
        // Refetch the assigned field sets for this contact using RPC
        const { data: assignedSetsData, error: assignedSetsError } = await supabase
          .rpc('get_contact_field_sets_with_details', { contact_id_param: entityId });
          
        if (assignedSetsError) {
          console.error('Error fetching assigned field sets:', assignedSetsError);
          
          // Fallback if RPC doesn't exist
          const { data: rawSetAssignments } = await supabase
            .from('contact_field_set_assignments')
            .select(`
              field_set_id
            `)
            .eq('contact_id', entityId);
            
          const fieldSetIds = rawSetAssignments?.map(item => item.field_set_id) || [];
          
          // Fetch fields for those field sets
          const updatedSets = [];
          
          for (const setId of fieldSetIds) {
            // Get the field set details
            const { data: setData } = await supabase
              .from('custom_field_sets')
              .select('*')
              .eq('id', setId)
              .single();
              
            if (setData) {
              // Get fields for this set
              const { data: fieldsInSetData } = await supabase
                .from('custom_field_definitions')
                .select('*')
                .eq('field_set', setId)
                .order('position');
                
              const mappedSet = mapToCustomFieldSet(setData);
              mappedSet.fields = (fieldsInSetData || []).map(mapToCustomFieldDefinition);
              
              updatedSets.push(mappedSet);
            }
          }
          
          setFieldSets(updatedSets);
        } else {
          // If RPC exists and returned data, use it
          const mappedSets = (assignedSetsData || []).map(setData => {
            const fieldSet = mapToCustomFieldSet({
              id: setData.id,
              name: setData.name,
              organization_id: setData.organization_id,
              entity_type: setData.entity_type,
              position: setData.position,
              created_at: setData.created_at,
              updated_at: setData.updated_at
            });
            
            // Add fields if they were included in the RPC response
            if (setData.fields) {
              fieldSet.fields = setData.fields.map(mapToCustomFieldDefinition);
            }
            
            return fieldSet;
          });
          
          setFieldSets(mappedSets);
        }
        
        // Get individually assigned fields (not in sets) using RPC
        const { data: assignedFieldsData, error: assignedFieldsError } = await supabase
          .rpc('get_contact_individual_fields', { contact_id_param: entityId });
          
        if (assignedFieldsError) {
          console.error('Error fetching assigned fields:', assignedFieldsError);
          
          // Fallback if RPC doesn't exist
          const { data: rawFieldAssignments } = await supabase
            .from('contact_field_assignments')
            .select(`
              field_id
            `)
            .eq('contact_id', entityId);
            
          const fieldIds = rawFieldAssignments?.map(item => item.field_id) || [];
          const fetchedFields = [];
          
          // Fetch each field individually
          for (const fieldId of fieldIds) {
            const { data: fieldData } = await supabase
              .from('custom_field_definitions')
              .select('*')
              .eq('id', fieldId)
              .single();
              
            if (fieldData) {
              fetchedFields.push(mapToCustomFieldDefinition(fieldData));
            }
          }
          
          setFields(fetchedFields);
        } else {
          // If RPC exists and returned data, use it
          setFields((assignedFieldsData || []).map(mapToCustomFieldDefinition));
        }
      } else {
        // For other entity types, fetch all fields as before
        
        // Fetch field sets
        const { data: setsData } = await supabase
          .from('custom_field_sets')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('entity_type', entityType)
          .order('position');
          
        const sets = (setsData || []).map(mapToCustomFieldSet);
        
        // Fetch fields for each set
        const updatedSets = [...sets];
        
        for (const [index, set] of updatedSets.entries()) {
          const { data: fieldsInSetData } = await supabase
            .from('custom_field_definitions')
            .select('*')
            .eq('field_set', set.id)
            .order('position');
          
          updatedSets[index] = {
            ...set,
            fields: (fieldsInSetData || []).map(mapToCustomFieldDefinition)
          };
        }
        
        setFieldSets(updatedSets);
        
        // Fetch standalone fields
        const { data: fieldsData } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('entity_type', entityType)
          .is('field_set', null)
          .order('position');
          
        setFields((fieldsData || []).map(mapToCustomFieldDefinition));
      }
    } catch (error) {
      console.error('Error refreshing custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizeFields = () => {
    if (entityType === 'contact' && entityId) {
      setSelectorOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // Check if there are any fields or field sets
  const hasContent = fields.length > 0 || fieldSets.length > 0;
  const isContact = entityType === 'contact';

  return (
    <div className="space-y-6">
      {isContact && entityId && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Custom Fields</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCustomizeFields}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4 mr-1" />
            Customize Fields
          </Button>
        </div>
      )}
      
      {hasContent ? (
        <>
          {/* Render field sets */}
          {fieldSets.length > 0 && (
            <div className="space-y-4">
              {fieldSets.map((fieldSet) => (
                <div key={fieldSet.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-4">{fieldSet.name}</h3>
                  <div className="space-y-4">
                    {fieldSet.fields && fieldSet.fields.map((field: CustomFieldDefinition) => (
                      <div key={field.id} className="space-y-1">
                        <Label>
                          {field.name}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderFieldInput(field)}
                      </div>
                    ))}
                    {(!fieldSet.fields || fieldSet.fields.length === 0) && (
                      <p className="text-muted-foreground text-sm">No fields in this set</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render standalone fields */}
          {fields.length > 0 && (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <Label>
                    {field.name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 border border-dashed border-gray-200 rounded-md">
          {isContact && entityId ? (
            <p className="text-gray-500 mb-2">No custom fields selected for this contact</p>
          ) : (
            <p className="text-gray-500 mb-2">No custom fields defined yet</p>
          )}
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
        onSuccess={handleRefreshFields}
      />
      
      {entityType === 'contact' && entityId && (
        <ContactCustomFieldSelector
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          contactId={entityId}
          onSuccess={handleRefreshFields}
        />
      )}
    </div>
  );
}
