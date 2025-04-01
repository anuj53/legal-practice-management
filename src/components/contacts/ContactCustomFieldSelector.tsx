
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Settings, Plus, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CustomFieldSet, 
  CustomFieldDefinition,
  mapToCustomFieldSet,
  mapToCustomFieldDefinition
} from '@/types/customField';

interface ContactCustomFieldSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  onSuccess: () => void;
}

export function ContactCustomFieldSelector({
  open,
  onOpenChange,
  contactId,
  onSuccess
}: ContactCustomFieldSelectorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [individualFields, setIndividualFields] = useState<CustomFieldDefinition[]>([]);
  const [selectedFieldSets, setSelectedFieldSets] = useState<string[]>([]);
  const [selectedIndividualFields, setSelectedIndividualFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('field-sets');

  // Fetch all available field sets and individual fields
  useEffect(() => {
    const fetchFields = async () => {
      if (!user || !open) return;
      
      setLoading(true);
      
      try {
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
        
        // Fetch field sets
        const { data: setsData } = await supabase
          .from('custom_field_sets')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', 'contact')
          .order('position');
          
        const mappedSets = (setsData || []).map(mapToCustomFieldSet);
        setFieldSets(mappedSets);
        
        // Fetch individual fields (that don't belong to any set)
        const { data: fieldsData } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', 'contact')
          .is('field_set', null)
          .order('position');
          
        const mappedFields = (fieldsData || []).map(mapToCustomFieldDefinition);
        setIndividualFields(mappedFields);
        
        // Fetch currently selected field sets for this contact using RPC
        const { data: setAssignmentsData, error: setAssignmentsError } = await supabase
          .rpc('get_contact_field_set_assignments', { contact_id_param: contactId });
          
        if (setAssignmentsError) {
          console.error('Error fetching field set assignments:', setAssignmentsError);
          setSelectedFieldSets([]);
        } else {
          setSelectedFieldSets((setAssignmentsData || []).map(item => item.field_set_id));
        }
        
        // Fetch currently selected individual fields for this contact using RPC
        const { data: fieldAssignmentsData, error: fieldAssignmentsError } = await supabase
          .rpc('get_contact_field_assignments', { contact_id_param: contactId });
          
        if (fieldAssignmentsError) {
          console.error('Error fetching field assignments:', fieldAssignmentsError);
          setSelectedIndividualFields([]);
        } else {
          setSelectedIndividualFields((fieldAssignmentsData || []).map(item => item.field_id));
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
    
    fetchFields();
  }, [user, contactId, open]);

  const handleFieldSetToggle = (id: string) => {
    setSelectedFieldSets(prev => 
      prev.includes(id) 
        ? prev.filter(setId => setId !== id)
        : [...prev, id]
    );
  };

  const handleIndividualFieldToggle = (id: string) => {
    setSelectedIndividualFields(prev => 
      prev.includes(id) 
        ? prev.filter(fieldId => fieldId !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user || !contactId) return;
    
    setSaving(true);
    
    try {
      // First, remove all existing assignments using RPC
      const { error: deleteError } = await supabase
        .rpc('delete_contact_field_assignments', { contact_id_param: contactId });
        
      if (deleteError) {
        throw deleteError;
      }
        
      // Add new field set assignments
      if (selectedFieldSets.length > 0) {
        // Prepare data for bulk insert via RPC
        const fieldSetAssignments = selectedFieldSets.map(fieldSetId => ({
          contact_id: contactId,
          field_set_id: fieldSetId
        }));
        
        const { error: insertSetsError } = await supabase.rpc(
          'insert_contact_field_set_assignments',
          { assignments: fieldSetAssignments }
        );
        
        if (insertSetsError) {
          throw insertSetsError;
        }
      }
      
      // Add new individual field assignments
      if (selectedIndividualFields.length > 0) {
        // Prepare data for bulk insert via RPC
        const fieldAssignments = selectedIndividualFields.map(fieldId => ({
          contact_id: contactId,
          field_id: fieldId
        }));
        
        const { error: insertFieldsError } = await supabase.rpc(
          'insert_contact_field_assignments',
          { assignments: fieldAssignments }
        );
        
        if (insertFieldsError) {
          throw insertFieldsError;
        }
      }
      
      toast({
        title: "Custom fields updated",
        description: "Custom fields for this contact have been updated successfully."
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving custom field selections:', error);
      toast({
        title: "Error",
        description: "Failed to save custom field selections.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Fields</DialogTitle>
          <DialogDescription>
            Select which custom fields to display for this contact.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yorpro-600" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="field-sets">Field Sets</TabsTrigger>
              <TabsTrigger value="individual-fields">Individual Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="field-sets" className="mt-4">
              {fieldSets.length > 0 ? (
                <div className="space-y-4">
                  {fieldSets.map(fieldSet => (
                    <div key={fieldSet.id} className="flex items-start space-x-3 p-3 border rounded-md">
                      <Checkbox 
                        id={`set-${fieldSet.id}`}
                        checked={selectedFieldSets.includes(fieldSet.id)}
                        onCheckedChange={() => handleFieldSetToggle(fieldSet.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`set-${fieldSet.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {fieldSet.name}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {fieldSet.fields ? `${fieldSet.fields.length} fields` : '0 fields'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No field sets have been created yet.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="individual-fields" className="mt-4">
              {individualFields.length > 0 ? (
                <div className="space-y-4">
                  {individualFields.map(field => (
                    <div key={field.id} className="flex items-start space-x-3 p-3 border rounded-md">
                      <Checkbox 
                        id={`field-${field.id}`}
                        checked={selectedIndividualFields.includes(field.id)}
                        onCheckedChange={() => handleIndividualFieldToggle(field.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`field-${field.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {field.name}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {field.field_type}
                          {field.is_required && ' (required)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No individual custom fields have been created yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
