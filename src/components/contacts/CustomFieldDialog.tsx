
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { CustomFieldDefinition, CustomFieldSet } from '@/types/customField';

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
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldDefinition['field_type']>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [selectedFieldSet, setSelectedFieldSet] = useState<string | null>(null);
  const [newFieldSetName, setNewFieldSetName] = useState('');
  const [showNewFieldSetInput, setShowNewFieldSetInput] = useState(false);

  // Fetch existing field sets
  useEffect(() => {
    if (user && open) {
      fetchFieldSets();
    }
  }, [user, entityType, open]);

  const fetchFieldSets = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (!profileData?.organization_id) {
        return;
      }

      const { data, error } = await supabase
        .from('custom_field_sets')
        .select('*')
        .eq('organization_id', profileData.organization_id)
        .eq('entity_type', entityType)
        .order('position');

      if (error) throw error;
      
      if (data) {
        setFieldSets(data as CustomFieldSet[]);
        // Set default field set if available
        if (data.length > 0) {
          setSelectedFieldSet(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching field sets:', error);
    }
  };

  const handleAddOption = () => {
    if (optionInput.trim() && !options.includes(optionInput.trim())) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const resetForm = () => {
    setName('');
    setFieldType('text');
    setIsRequired(false);
    setDefaultValue('');
    setOptions([]);
    setOptionInput('');
    setSelectedFieldSet(fieldSets.length > 0 ? fieldSets[0].id : null);
    setNewFieldSetName('');
    setShowNewFieldSetInput(false);
  };

  const createNewFieldSet = async (): Promise<string | null> => {
    if (!newFieldSetName.trim() || !user) return null;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.organization_id) {
        throw new Error("Organization not found");
      }

      // Get next position value
      let position = 0;
      if (fieldSets.length > 0) {
        position = Math.max(...fieldSets.map(set => set.position || 0)) + 1;
      }

      const { data, error } = await supabase
        .from('custom_field_sets')
        .insert({
          name: newFieldSetName.trim(),
          entity_type: entityType,
          organization_id: profileData.organization_id,
          position
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state with new field set
      const newFieldSet = data as CustomFieldSet;
      setFieldSets([...fieldSets, newFieldSet]);
      return newFieldSet.id;
    } catch (error) {
      console.error('Error creating field set:', error);
      toast({
        title: "Error",
        description: "Failed to create field set.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create custom fields.",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Field name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get user's organization ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.organization_id) {
        throw new Error("Organization not found");
      }

      // Create new field set if needed
      let fieldSetId = selectedFieldSet;
      if (showNewFieldSetInput) {
        const newId = await createNewFieldSet();
        if (newId) {
          fieldSetId = newId;
        }
      }

      // Get next position value for the field
      const { data: existingFields } = await supabase
        .from('custom_field_definitions')
        .select('position')
        .eq('field_set', fieldSetId)
        .order('position', { ascending: false })
        .limit(1);
      
      let position = 0;
      if (existingFields && existingFields.length > 0) {
        const highestPosition = existingFields[0]?.position || 0;
        position = highestPosition + 1;
      }

      const fieldData = {
        organization_id: profileData.organization_id,
        name: name.trim(),
        field_type: fieldType,
        entity_type: entityType,
        default_value: defaultValue || null,
        is_required: isRequired,
        options: fieldType === 'select' ? options : null,
        field_set: fieldSetId,
        position
      };

      const { error } = await supabase
        .from('custom_field_definitions')
        .insert(fieldData);
        
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          throw new Error("A field with this name already exists");
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Custom field created successfully."
      });
      
      if (onSuccess) onSuccess();
      resetForm();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error creating custom field:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create custom field.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom Field</DialogTitle>
          <DialogDescription>
            Add a new custom field for {entityType === 'contact' ? 'contacts' : entityType === 'matter' ? 'matters' : 'tasks'}.
            This field will be available for all {entityType}s in your organization.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fieldSet">Field Set</Label>
            {!showNewFieldSetInput ? (
              <div className="flex gap-2">
                <Select 
                  value={selectedFieldSet || ""} 
                  onValueChange={setSelectedFieldSet}>
                  <SelectTrigger id="fieldSet" className="flex-1">
                    <SelectValue placeholder="Select a field set" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldSets.map(set => (
                      <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Create new field set</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewFieldSetInput(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New Field Set</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newFieldSetName}
                  onChange={(e) => setNewFieldSetName(e.target.value)}
                  placeholder="New field set name"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowNewFieldSetInput(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Field Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Referral Source"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type <span className="text-red-500">*</span></Label>
            <Select 
              value={fieldType} 
              onValueChange={(value) => setFieldType(value as CustomFieldDefinition['field_type'])}>
              <SelectTrigger id="fieldType">
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
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
            <Label htmlFor="isRequired">Required Field</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Default value (optional)"
            />
          </div>

          {fieldType === 'select' && (
            <div className="space-y-3 border border-gray-200 rounded-md p-3">
              <Label>Options</Label>
              <div className="flex space-x-2">
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Add option"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{option}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No options added yet</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Field
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
