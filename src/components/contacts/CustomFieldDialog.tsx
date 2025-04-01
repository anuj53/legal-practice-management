import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CustomFieldDefinition, mapToCustomFieldDefinition } from '@/types/customField';

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'contact' | 'matter' | 'task';
  fieldSetId?: string;
  field?: CustomFieldDefinition;
  onSuccess?: () => void;
}

export function CustomFieldDialog({
  open,
  onOpenChange,
  entityType,
  fieldSetId,
  field,
  onSuccess
}: CustomFieldDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'phone' | 'url'>('text');
  const [defaultValue, setDefaultValue] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string>('');
  const [fieldSet, setFieldSet] = useState<string | null>(fieldSetId || null);
  const [availableFieldSets, setAvailableFieldSets] = useState<{ id: string; name: string }[]>([]);
  
  const isEditing = !!field;
  
  useEffect(() => {
    if (open) {
      if (field) {
        setName(field.name || '');
        setFieldType(field.field_type);
        setDefaultValue(field.default_value || '');
        setIsRequired(field.is_required || false);
        setOptions(field.options ? field.options.join('\n') : '');
        setFieldSet(field.field_set || null);
      } else {
        setName('');
        setFieldType('text');
        setDefaultValue('');
        setIsRequired(false);
        setOptions('');
        setFieldSet(fieldSetId || null);
      }
      
      if (!fieldSetId) {
        fetchFieldSets();
      }
    }
  }, [open, field, fieldSetId]);
  
  const fetchFieldSets = async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!profileData?.organization_id) return;
      
      const { data: sets, error } = await supabase
        .from('custom_field_sets')
        .select('id, name')
        .eq('organization_id', profileData.organization_id)
        .eq('entity_type', entityType)
        .order('name');
        
      if (error) throw error;
      
      if (sets) {
        setAvailableFieldSets(sets);
      }
    } catch (error) {
      console.error('Error fetching field sets:', error);
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
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.organization_id) {
        throw new Error("Organization not found");
      }
      
      let parsedOptions: string[] | null = null;
      if (fieldType === 'select' && options.trim()) {
        parsedOptions = options.split('\n')
          .filter(option => option.trim())
          .map(option => option.trim());
      }
      
      let nextPosition = 0;
      
      if (isEditing) {
        nextPosition = field.position;
      } else {
        const positionQuery = supabase
          .from('custom_field_definitions')
          .select('position')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', entityType);
          
        if (fieldSet) {
          positionQuery.eq('field_set', fieldSet);
        } else {
          positionQuery.is('field_set', null);
        }
        
        positionQuery.order('position', { ascending: false }).limit(1);
        
        const { data: fields } = await positionQuery;
          
        nextPosition = (fields && fields.length > 0 && fields[0]?.position != null)
          ? (fields[0].position + 1)
          : 0;
      }
      
      const fieldData = {
        name: name.trim(),
        field_type: fieldType,
        entity_type: entityType,
        organization_id: profileData.organization_id,
        default_value: defaultValue.trim() || null,
        is_required: isRequired,
        options: parsedOptions,
        field_set: fieldSet,
        position: nextPosition
      };
      
      let result;
      
      if (isEditing) {
        const { data, error } = await supabase
          .from('custom_field_definitions')
          .update(fieldData)
          .eq('id', field.id)
          .select('*')
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Success",
          description: "Custom field updated successfully."
        });
      } else {
        const { data, error } = await supabase
          .from('custom_field_definitions')
          .insert(fieldData)
          .select('*')
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Success",
          description: "Custom field created successfully."
        });
      }
      
      const typedResult = mapToCustomFieldDefinition(result);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error saving custom field:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save custom field.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Custom Field" : "Create Custom Field"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update this custom field's properties." 
              : `Add a new custom field for ${entityType === 'contact' ? 'contacts' : entityType === 'matter' ? 'matters' : 'tasks'}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Field Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Client ID"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type <span className="text-red-500">*</span></Label>
              <Select
                value={fieldType}
                onValueChange={(value) => setFieldType(value as any)}
              >
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Select a field type" />
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
            
            {!fieldSetId && availableFieldSets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="field-set">Field Set (Optional)</Label>
                <Select
                  value={fieldSet || ""}
                  onValueChange={(value) => setFieldSet(value || null)}
                >
                  <SelectTrigger id="field-set">
                    <SelectValue placeholder="No Field Set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Field Set</SelectItem>
                    {availableFieldSets.map(set => (
                      <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-value">Default Value</Label>
            <Input
              id="default-value"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder={fieldType === 'email' ? 'example@email.com' : 'Default value'}
            />
          </div>
          
          {fieldType === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="options">Options</Label>
              <Textarea
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Enter each option on a new line"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Enter each option on a new line.</p>
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              checked={isRequired}
              onCheckedChange={setIsRequired}
              id="required"
            />
            <Label htmlFor="required">Required field</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
