
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomFieldDefinition, CustomFieldSet, DbTables } from '@/types/customField';
import { useNavigate } from 'react-router-dom';

interface ContactCustomFieldSelectorProps {
  contactId?: string;
  onSelectionChange: (selectedFieldIds: string[]) => void;
}

export function ContactCustomFieldSelector({
  contactId,
  onSelectionChange
}: ContactCustomFieldSelectorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  
  // Fetch the organization ID and then custom fields and sets
  useEffect(() => {
    const fetchOrganizationId = async () => {
      if (!user) return null;
      
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileData?.organization_id) {
          setOrganizationId(profileData.organization_id);
          return profileData.organization_id;
        }
        return null;
      } catch (error) {
        console.error('Error fetching organization ID:', error);
        return null;
      }
    };
    
    const fetchData = async () => {
      setLoading(true);
      const orgId = await fetchOrganizationId();
      if (!orgId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch custom field sets
        const { data: fieldSetData, error: fieldSetError } = await supabase
          .from('custom_field_sets' as DbTables)
          .select('*')
          .eq('organization_id', orgId)
          .eq('entity_type', 'contact')
          .order('position');
        
        if (fieldSetError) throw fieldSetError;
        setFieldSets(fieldSetData as unknown as CustomFieldSet[] || []);
        
        // Fetch custom fields
        const { data: fieldData, error: fieldError } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('organization_id', orgId)
          .eq('entity_type', 'contact')
          .order('position');
        
        if (fieldError) throw fieldError;
        setFields(fieldData || []);
        
        // If we have a contact ID, fetch active custom fields for this contact
        if (contactId) {
          const { data: contactFields, error: contactFieldsError } = await supabase
            .from('contact_custom_fields')
            .select('field_definition_id')
            .eq('contact_id', contactId)
            .eq('is_active', true);
          
          if (contactFieldsError) throw contactFieldsError;
          
          if (contactFields) {
            const activeFieldIds = contactFields.map(cf => cf.field_definition_id);
            setSelectedFieldIds(activeFieldIds);
            
            // Determine which sets should be selected
            const newSelectedSetIds: string[] = [];
            fieldSetData.forEach((set: any) => {
              const fieldsInSet = fieldData.filter(f => f.field_set === set.id);
              const allFieldsInSetSelected = fieldsInSet.every(f => activeFieldIds.includes(f.id));
              if (allFieldsInSetSelected && fieldsInSet.length > 0) {
                newSelectedSetIds.push(set.id);
              }
            });
            setSelectedSetIds(newSelectedSetIds);
          }
        }
      } catch (error) {
        console.error('Error fetching custom fields data:', error);
        toast({
          title: "Error",
          description: "Failed to load custom fields.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, contactId]);

  // Handle individual field selection
  const handleFieldSelection = (fieldId: string, checked: boolean) => {
    let newSelectedFieldIds = [...selectedFieldIds];
    
    if (checked) {
      if (!newSelectedFieldIds.includes(fieldId)) {
        newSelectedFieldIds.push(fieldId);
      }
    } else {
      newSelectedFieldIds = newSelectedFieldIds.filter(id => id !== fieldId);
    }
    
    setSelectedFieldIds(newSelectedFieldIds);
    onSelectionChange(newSelectedFieldIds);
    
    // Update field set selection state
    updateFieldSetSelection(newSelectedFieldIds);
  };

  // Handle field set selection
  const handleFieldSetSelection = (setId: string, checked: boolean) => {
    // Get all fields in this set
    const fieldsInSet = fields.filter(f => f.field_set === setId);
    const fieldIdsInSet = fieldsInSet.map(f => f.id);
    
    let newSelectedFieldIds = [...selectedFieldIds];
    
    if (checked) {
      // Add all fields in the set
      fieldIdsInSet.forEach(id => {
        if (!newSelectedFieldIds.includes(id)) {
          newSelectedFieldIds.push(id);
        }
      });
      
      // Add set to selected sets
      setSelectedSetIds([...selectedSetIds, setId]);
    } else {
      // Remove all fields in the set
      newSelectedFieldIds = newSelectedFieldIds.filter(id => !fieldIdsInSet.includes(id));
      
      // Remove set from selected sets
      setSelectedSetIds(selectedSetIds.filter(id => id !== setId));
    }
    
    setSelectedFieldIds(newSelectedFieldIds);
    onSelectionChange(newSelectedFieldIds);
  };

  // Update selected sets based on selected fields
  const updateFieldSetSelection = (selectedFields: string[]) => {
    const newSelectedSetIds: string[] = [];
    
    fieldSets.forEach(set => {
      const fieldsInSet = fields.filter(f => f.field_set === set.id);
      const fieldIdsInSet = fieldsInSet.map(f => f.id);
      
      // If all fields in this set are selected, mark the set as selected
      const allFieldsSelected = fieldIdsInSet.length > 0 && fieldIdsInSet.every(id => selectedFields.includes(id));
      
      if (allFieldsSelected) {
        newSelectedSetIds.push(set.id);
      }
    });
    
    setSelectedSetIds(newSelectedSetIds);
  };

  const navigateToSettings = () => {
    navigate('/settings/custom-fields');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // Get unassigned fields (not in any field set)
  const unassignedFields = fields.filter(f => f.field_set === null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Custom Fields</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={navigateToSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Fields
        </Button>
      </div>
      
      <div className="space-y-4">
        {fieldSets.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Field Sets</p>
            {fieldSets.map(set => {
              const fieldsInSet = fields.filter(f => f.field_set === set.id);
              if (fieldsInSet.length === 0) return null;
              
              return (
                <div key={set.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`set-${set.id}`} 
                    checked={selectedSetIds.includes(set.id)}
                    onCheckedChange={(checked) => handleFieldSetSelection(set.id, checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`set-${set.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {set.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {fieldsInSet.length} field{fieldsInSet.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            <Separator className="my-4" />
          </div>
        )}
        
        {unassignedFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Individual Fields</p>
            {unassignedFields.map(field => (
              <div key={field.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={`field-${field.id}`} 
                  checked={selectedFieldIds.includes(field.id)}
                  onCheckedChange={(checked) => handleFieldSelection(field.id, checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {field.field_type.charAt(0).toUpperCase() + field.field_type.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {fieldSets.length === 0 && unassignedFields.length === 0 && (
          <div className="text-center p-4 border border-dashed border-gray-200 rounded-md">
            <p className="text-gray-500 mb-2">No custom fields defined yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={navigateToSettings}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Custom Fields
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
