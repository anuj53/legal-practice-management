
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs';
import { CustomFieldDefinition, CustomFieldSet, DbTables } from '@/types/customField';
import { Loader2 } from 'lucide-react';

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'contact' | 'matter' | 'task';
  onSuccess?: () => void;
}

export function CustomFieldDialog({
  open,
  onOpenChange,
  entityType,
  onSuccess
}: CustomFieldDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("field");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  
  const [field, setField] = useState<Partial<CustomFieldDefinition>>({
    name: '',
    field_type: 'text',
    default_value: '',
    is_required: false,
    options: ['Option 1', 'Option 2'],
    field_set: null,
    entity_type: entityType,
    position: 0
  });
  
  const [fieldSet, setFieldSet] = useState<Partial<CustomFieldSet>>({
    name: '',
    entity_type: entityType,
    position: 0
  });

  // Fetch organization ID and field sets when the dialog opens
  useEffect(() => {
    if (!open || !user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get organization ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        if (!profileData?.organization_id) {
          throw new Error("Organization not found");
        }
        
        setOrganizationId(profileData.organization_id);
        
        // Fetch field sets
        const { data: fieldSetData, error: fieldSetError } = await supabase
          .from('custom_field_sets' as DbTables)
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', entityType)
          .order('position');
        
        if (fieldSetError) throw fieldSetError;
        setFieldSets(fieldSetData as unknown as CustomFieldSet[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load field sets.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [open, user, entityType]);

  const handleFieldTypeChange = (type: string) => {
    setField({
      ...field,
      field_type: type as CustomFieldDefinition['field_type'],
      // Reset options if switching away from select
      options: type === 'select' ? field.options || ['Option 1', 'Option 2'] : null,
    });
  };

  const handleOptionsChange = (optionsText: string) => {
    const optionsArray = optionsText.split('\n')
      .map(option => option.trim())
      .filter(option => option.length > 0);
    
    setField({
      ...field,
      options: optionsArray.length > 0 ? optionsArray : ['Option 1']
    });
  };

  const createCustomField = async () => {
    if (!user || !organizationId) {
      toast({
        title: "Error",
        description: "User or organization not found.",
        variant: "destructive"
      });
      return;
    }
    
    if (!field.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Field name is required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCreating(true);
      
      // Get the max position for ordering
      const { data: existingFields, error: positionError } = await supabase
        .from('custom_field_definitions')
        .select('position')
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType)
        .eq('field_set', field.field_set || null);
      
      let position = 0;
      if (!positionError && existingFields && existingFields.length > 0) {
        // Find the max position and add 1
        position = Math.max(...existingFields.map((f: any) => f.position || 0)) + 1;
      }
      
      const { data, error } = await supabase
        .from('custom_field_definitions')
        .insert({
          name: field.name,
          field_type: field.field_type,
          entity_type: entityType,
          default_value: field.default_value || null,
          is_required: field.is_required || false,
          options: field.options,
          field_set: field.field_set || null,
          organization_id: organizationId,
          position: position
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Custom field created successfully."
      });
      
      // Reset form
      setField({
        name: '',
        field_type: 'text',
        default_value: '',
        is_required: false,
        options: ['Option 1', 'Option 2'],
        field_set: null,
        entity_type: entityType,
        position: 0
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating custom field:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create custom field.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const createFieldSet = async () => {
    if (!user || !organizationId) {
      toast({
        title: "Error",
        description: "User or organization not found.",
        variant: "destructive"
      });
      return;
    }
    
    if (!fieldSet.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Field set name is required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCreating(true);
      
      // Get the max position for ordering
      const { data: existingSets } = await supabase
        .from('custom_field_sets' as DbTables)
        .select('position')
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType);
      
      let position = 0;
      if (existingSets && existingSets.length > 0) {
        // Find the max position and add 1
        position = Math.max(...existingSets.map((s: any) => s.position || 0)) + 1;
      }
      
      const { data, error } = await supabase
        .from('custom_field_sets' as DbTables)
        .insert({
          name: fieldSet.name,
          entity_type: entityType,
          organization_id: organizationId,
          position: position
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Field set created successfully."
      });
      
      // Reset form
      setFieldSet({
        name: '',
        entity_type: entityType,
        position: 0
      });
      
      // Add the new field set to the list
      if (data) {
        setFieldSets([...fieldSets, data[0] as unknown as CustomFieldSet]);
      }
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating field set:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create field set.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Create a custom field or field set for {entityType === 'contact' ? 'contacts' : entityType === 'matter' ? 'matters' : 'tasks'}.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Tabs defaultValue="field" value={activeTab} onValueChange={setActiveTab}>
            <TabList className="grid grid-cols-2 mb-4">
              <Tab value="field">Custom Field</Tab>
              <Tab value="fieldset">Field Set</Tab>
            </TabList>
            
            <TabPanel value="field">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Field Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={field.name || ''}
                    onChange={(e) => setField({ ...field, name: e.target.value })}
                    placeholder="e.g., Company Size, Industry, Enrollment Date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field-type">Field Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.field_type}
                    onValueChange={handleFieldTypeChange}
                  >
                    <SelectTrigger id="field-type">
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {field.field_type === 'select' && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Options (one per line) <span className="text-red-500">*</span></Label>
                    <textarea
                      id="options"
                      className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                      value={field.options?.join('\n') || ''}
                      onChange={(e) => handleOptionsChange(e.target.value)}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="default-value">Default Value</Label>
                  <Input
                    id="default-value"
                    value={field.default_value || ''}
                    onChange={(e) => setField({ ...field, default_value: e.target.value })}
                    placeholder="Default value (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field-set">Field Set</Label>
                  <Select
                    value={field.field_set || ''}
                    onValueChange={(value) => setField({ ...field, field_set: value || null })}
                  >
                    <SelectTrigger id="field-set">
                      <SelectValue placeholder="None (General)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (General)</SelectItem>
                      {fieldSets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Field sets help organize related custom fields together
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-required"
                    checked={field.is_required || false}
                    onCheckedChange={(checked) => setField({ ...field, is_required: checked })}
                  />
                  <Label htmlFor="is-required">Required Field</Label>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="fieldset">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="set-name">Field Set Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="set-name"
                    value={fieldSet.name || ''}
                    onChange={(e) => setFieldSet({ ...fieldSet, name: e.target.value })}
                    placeholder="e.g., Employment Info, Education, Client Preferences"
                  />
                  <p className="text-xs text-muted-foreground">
                    A field set is a group of related custom fields that will appear together
                  </p>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={activeTab === "field" ? createCustomField : createFieldSet}
            disabled={creating || loading}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeTab === "field" ? "Create Field" : "Create Field Set"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
