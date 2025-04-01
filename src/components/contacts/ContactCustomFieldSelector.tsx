
import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabaseClient } from '@/integrations/supabase/client';
import { CustomFieldDefinition, CustomFieldSet, ContactCustomField } from '@/types/customField';
import { castQueryResult } from '@/utils/supabaseUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ContactCustomFieldSelectorProps {
  contactId?: string;
  onSelectedFieldsChange?: (selectedFields: string[]) => void;
}

export function ContactCustomFieldSelector({ 
  contactId, 
  onSelectedFieldsChange 
}: ContactCustomFieldSelectorProps) {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomFieldsAndSets = async () => {
    try {
      setLoading(true);
      
      // Fetch custom field sets
      const { data: setsData, error: setsError } = await supabaseClient
        .from('custom_field_sets')
        .select('*')
        .eq('entity_type', 'contact')
        .order('position', { ascending: true });
        
      if (setsError) throw new Error(setsError.message);
      
      // Fetch custom fields
      const { data: fieldsData, error: fieldsError } = await supabaseClient
        .from('custom_field_definitions')
        .select('*')
        .eq('entity_type', 'contact')
        .order('position', { ascending: true });
        
      if (fieldsError) throw new Error(fieldsError.message);
      
      // Set data with proper type casting
      setFieldSets(castQueryResult<CustomFieldSet[]>(setsData || []));
      setCustomFields(castQueryResult<CustomFieldDefinition[]>(fieldsData || []));
      
      // If contactId is provided, fetch selected fields for this contact
      if (contactId) {
        const { data: selectedFieldsData, error: selectionError } = await supabaseClient
          .from('contact_custom_fields')
          .select('field_definition_id')
          .eq('contact_id', contactId)
          .eq('is_active', true);
          
        if (selectionError) throw new Error(selectionError.message);
        
        if (selectedFieldsData) {
          const fieldIds = castQueryResult<{ field_definition_id: string }[]>(selectedFieldsData)
            .map(item => item.field_definition_id);
          setSelectedFields(fieldIds);
          if (onSelectedFieldsChange) {
            onSelectedFieldsChange(fieldIds);
          }
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      setError('Failed to load custom fields. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomFieldsAndSets();
  }, [contactId]);

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    let newSelectedFields: string[];
    
    if (checked) {
      newSelectedFields = [...selectedFields, fieldId];
    } else {
      newSelectedFields = selectedFields.filter(id => id !== fieldId);
    }
    
    setSelectedFields(newSelectedFields);
    
    if (onSelectedFieldsChange) {
      onSelectedFieldsChange(newSelectedFields);
    }
  };

  // Helper function to check if all fields in a set are selected
  const isFieldSetSelected = (setId: string) => {
    const fieldsInSet = customFields.filter(field => field.field_set === setId);
    return fieldsInSet.length > 0 && fieldsInSet.every(field => selectedFields.includes(field.id));
  };

  // Function to toggle all fields in a set
  const toggleFieldSet = (setId: string, checked: boolean) => {
    const fieldsInSet = customFields.filter(field => field.field_set === setId).map(field => field.id);
    let newSelectedFields: string[];
    
    if (checked) {
      // Add all fields from the set that aren't already selected
      newSelectedFields = [...new Set([...selectedFields, ...fieldsInSet])];
    } else {
      // Remove all fields from the set
      newSelectedFields = selectedFields.filter(id => !fieldsInSet.includes(id));
    }
    
    setSelectedFields(newSelectedFields);
    
    if (onSelectedFieldsChange) {
      onSelectedFieldsChange(newSelectedFields);
    }
  };

  if (loading) {
    return <div className="p-4">Loading custom fields...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Get fields that aren't part of any set
  const standaloneFields = customFields.filter(field => !field.field_set);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Custom Fields</h3>
      
      {fieldSets.length > 0 && (
        <Accordion type="multiple" className="w-full">
          {fieldSets.map(fieldSet => {
            const fieldsInSet = customFields.filter(field => field.field_set === fieldSet.id);
            
            if (fieldsInSet.length === 0) return null;
            
            return (
              <AccordionItem key={fieldSet.id} value={fieldSet.id}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`field-set-${fieldSet.id}`}
                    checked={isFieldSetSelected(fieldSet.id)}
                    onCheckedChange={(checked) => toggleFieldSet(fieldSet.id, !!checked)}
                  />
                  <AccordionTrigger className="hover:no-underline">
                    <Label htmlFor={`field-set-${fieldSet.id}`} className="text-sm font-medium">
                      {fieldSet.name}
                    </Label>
                  </AccordionTrigger>
                </div>
                <AccordionContent>
                  <div className="pl-6 space-y-2">
                    {fieldsInSet.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-${field.id}`}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={(checked) => handleFieldToggle(field.id, !!checked)}
                        />
                        <Label htmlFor={`field-${field.id}`} className="text-sm">
                          {field.name} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      
      {standaloneFields.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Individual Fields</h4>
          {standaloneFields.map(field => (
            <div key={field.id} className="flex items-center space-x-2">
              <Checkbox
                id={`field-${field.id}`}
                checked={selectedFields.includes(field.id)}
                onCheckedChange={(checked) => handleFieldToggle(field.id, !!checked)}
              />
              <Label htmlFor={`field-${field.id}`} className="text-sm">
                {field.name} {field.is_required && <span className="text-red-500">*</span>}
              </Label>
            </div>
          ))}
        </div>
      )}
      
      {customFields.length === 0 && (
        <p className="text-sm text-muted-foreground">No custom fields available. Create them in the settings.</p>
      )}
    </div>
  );
}
