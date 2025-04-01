
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings, Trash2, Edit, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CustomFieldDefinition, CustomFieldSet, DbTables } from '@/types/customField';

export function CustomFieldsSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [activeTab, setActiveTab] = useState('fields');
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [editingFieldSet, setEditingFieldSet] = useState<CustomFieldSet | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<'contact' | 'matter' | 'task'>('contact');

  // Fetch the organization ID first, then use it to fetch fields and field sets
  useEffect(() => {
    const getOrganizationId = async () => {
      if (!user) return;
      
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
    
    const fetchCustomFieldsData = async () => {
      const orgId = await getOrganizationId();
      if (!orgId) return;
      
      setLoading(true);
      try {
        // Fetch custom fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('organization_id', orgId)
          .eq('entity_type', entityTypeFilter)
          .order('position');
        
        if (fieldsError) throw fieldsError;
        setFields(fieldsData || []);
        
        // Fetch field sets
        const { data: fieldSetsData, error: fieldSetsError } = await supabase
          .from('custom_field_sets' as DbTables)
          .select('*')
          .eq('organization_id', orgId)
          .eq('entity_type', entityTypeFilter)
          .order('position');
        
        if (fieldSetsError) throw fieldSetsError;
        setFieldSets(fieldSetsData as unknown as CustomFieldSet[] || []);
      } catch (error) {
        console.error('Error fetching custom fields data:', error);
        toast({
          title: "Error",
          description: "Failed to load custom field settings.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomFieldsData();
  }, [user, entityTypeFilter]);

  // Create a new empty field for editing
  const createNewField = () => {
    if (!organizationId) return;
    
    const newField: CustomFieldDefinition = {
      id: '', // Will be assigned by the database
      name: '',
      organization_id: organizationId,
      entity_type: entityTypeFilter,
      field_type: 'text',
      default_value: null,
      is_required: false,
      options: null,
      field_set: null,
      position: fields.length > 0 ? Math.max(...fields.map(f => f.position || 0)) + 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setEditingField(newField);
  };

  // Create a new empty field set for editing
  const createNewFieldSet = () => {
    if (!organizationId) return;
    
    const newFieldSet: CustomFieldSet = {
      id: '', // Will be assigned by the database
      name: '',
      entity_type: entityTypeFilter,
      organization_id: organizationId,
      position: fieldSets.length > 0 ? Math.max(...fieldSets.map(fs => fs.position)) + 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setEditingFieldSet(newFieldSet);
  };

  // Save a custom field
  const saveField = async () => {
    if (!editingField || !organizationId) return;
    
    try {
      // Validate field
      if (!editingField.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Field name is required",
          variant: "destructive"
        });
        return;
      }
      
      if (editingField.field_type === 'select' && (!editingField.options || editingField.options.length === 0)) {
        toast({
          title: "Validation Error",
          description: "Select fields must have at least one option",
          variant: "destructive"
        });
        return;
      }
      
      // If it's a new field (no ID), create it
      if (!editingField.id) {
        const { data, error } = await supabase
          .from('custom_field_definitions')
          .insert({
            name: editingField.name,
            organization_id: organizationId,
            entity_type: editingField.entity_type,
            field_type: editingField.field_type,
            default_value: editingField.default_value,
            is_required: editingField.is_required,
            options: editingField.options,
            field_set: editingField.field_set,
            position: editingField.position
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Add the new field to the list
        setFields([...fields, data as CustomFieldDefinition]);
        toast({
          title: "Success",
          description: "Custom field created successfully",
        });
      } else {
        // Update existing field
        const { error } = await supabase
          .from('custom_field_definitions')
          .update({
            name: editingField.name,
            field_type: editingField.field_type,
            default_value: editingField.default_value,
            is_required: editingField.is_required,
            options: editingField.options,
            field_set: editingField.field_set,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingField.id);
        
        if (error) throw error;
        
        // Update the field in the list
        setFields(fields.map(f => f.id === editingField.id ? editingField : f));
        toast({
          title: "Success",
          description: "Custom field updated successfully",
        });
      }
      
      // Clear editing state
      setEditingField(null);
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast({
        title: "Error",
        description: "Failed to save custom field",
        variant: "destructive"
      });
    }
  };

  // Save a field set
  const saveFieldSet = async () => {
    if (!editingFieldSet || !organizationId) return;
    
    try {
      // Validate
      if (!editingFieldSet.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Field set name is required",
          variant: "destructive"
        });
        return;
      }
      
      // If it's a new field set (no ID), create it
      if (!editingFieldSet.id) {
        const { data, error } = await supabase
          .from('custom_field_sets' as DbTables)
          .insert({
            name: editingFieldSet.name,
            organization_id: organizationId,
            entity_type: editingFieldSet.entity_type,
            position: editingFieldSet.position
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Add the new field set to the list
        setFieldSets([...fieldSets, data as unknown as CustomFieldSet]);
        toast({
          title: "Success",
          description: "Field set created successfully",
        });
      } else {
        // Update existing field set
        const { error } = await supabase
          .from('custom_field_sets' as DbTables)
          .update({
            name: editingFieldSet.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFieldSet.id);
        
        if (error) throw error;
        
        // Update the field set in the list
        setFieldSets(fieldSets.map(fs => fs.id === editingFieldSet.id ? editingFieldSet : fs));
        toast({
          title: "Success",
          description: "Field set updated successfully",
        });
      }
      
      // Clear editing state
      setEditingFieldSet(null);
    } catch (error) {
      console.error('Error saving field set:', error);
      toast({
        title: "Error",
        description: "Failed to save field set",
        variant: "destructive"
      });
    }
  };

  // Delete a custom field
  const deleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('custom_field_definitions')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
      
      // Remove field from the list
      setFields(fields.filter(f => f.id !== fieldId));
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom field. It may be in use by contacts.",
        variant: "destructive"
      });
    }
  };

  // Delete a field set
  const deleteFieldSet = async (fieldSetId: string) => {
    try {
      // Check if there are fields using this set
      const { data: usingFields, error: checkError } = await supabase
        .from('custom_field_definitions')
        .select('id')
        .eq('field_set', fieldSetId);
      
      if (checkError) throw checkError;
      
      if (usingFields && usingFields.length > 0) {
        toast({
          title: "Can't Delete",
          description: `This field set has ${usingFields.length} fields assigned to it. Please reassign or delete those fields first.`,
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('custom_field_sets' as DbTables)
        .delete()
        .eq('id', fieldSetId);
      
      if (error) throw error;
      
      // Remove field set from the list
      setFieldSets(fieldSets.filter(fs => fs.id !== fieldSetId));
      toast({
        title: "Success",
        description: "Field set deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting field set:', error);
      toast({
        title: "Error",
        description: "Failed to delete field set",
        variant: "destructive"
      });
    }
  };

  // Move a field up or down within its set
  const moveField = async (field: CustomFieldDefinition, direction: 'up' | 'down') => {
    const fieldsInSameSet = field.field_set
      ? fields.filter(f => f.field_set === field.field_set)
      : fields.filter(f => f.field_set === null);
    
    const currentIndex = fieldsInSameSet.findIndex(f => f.id === field.id);
    if (currentIndex === -1) return;
    
    let newPosition: number;
    if (direction === 'up' && currentIndex > 0) {
      newPosition = fieldsInSameSet[currentIndex - 1].position || 0;
    } else if (direction === 'down' && currentIndex < fieldsInSameSet.length - 1) {
      newPosition = fieldsInSameSet[currentIndex + 1].position || 0;
    } else {
      return; // Can't move further
    }
    
    try {
      // Update position in database
      const { error } = await supabase
        .from('custom_field_definitions')
        .update({ position: newPosition })
        .eq('id', field.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedFields = [...fields];
      const fieldIndex = updatedFields.findIndex(f => f.id === field.id);
      
      if (direction === 'up' && currentIndex > 0) {
        const swapIndex = updatedFields.findIndex(f => f.id === fieldsInSameSet[currentIndex - 1].id);
        updatedFields[fieldIndex].position = newPosition;
        updatedFields[swapIndex].position = field.position;
      } else if (direction === 'down' && currentIndex < fieldsInSameSet.length - 1) {
        const swapIndex = updatedFields.findIndex(f => f.id === fieldsInSameSet[currentIndex + 1].id);
        updatedFields[fieldIndex].position = newPosition;
        updatedFields[swapIndex].position = field.position;
      }
      
      // Resort fields
      updatedFields.sort((a, b) => (a.position || 0) - (b.position || 0));
      setFields(updatedFields);
    } catch (error) {
      console.error('Error moving field:', error);
      toast({
        title: "Error",
        description: "Failed to reorder field",
        variant: "destructive"
      });
    }
  };

  // Move a field set up or down
  const moveFieldSet = async (fieldSet: CustomFieldSet, direction: 'up' | 'down') => {
    const currentIndex = fieldSets.findIndex(fs => fs.id === fieldSet.id);
    if (currentIndex === -1) return;
    
    let newPosition: number;
    if (direction === 'up' && currentIndex > 0) {
      newPosition = fieldSets[currentIndex - 1].position;
    } else if (direction === 'down' && currentIndex < fieldSets.length - 1) {
      newPosition = fieldSets[currentIndex + 1].position;
    } else {
      return; // Can't move further
    }
    
    try {
      // Update position in database
      const { error } = await supabase
        .from('custom_field_sets' as DbTables)
        .update({ position: newPosition })
        .eq('id', fieldSet.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedFieldSets = [...fieldSets];
      const fieldSetIndex = updatedFieldSets.findIndex(fs => fs.id === fieldSet.id);
      
      if (direction === 'up' && currentIndex > 0) {
        const swapIndex = currentIndex - 1;
        updatedFieldSets[fieldSetIndex].position = newPosition;
        updatedFieldSets[swapIndex].position = fieldSet.position;
      } else if (direction === 'down' && currentIndex < fieldSets.length - 1) {
        const swapIndex = currentIndex + 1;
        updatedFieldSets[fieldSetIndex].position = newPosition;
        updatedFieldSets[swapIndex].position = fieldSet.position;
      }
      
      // Resort field sets
      updatedFieldSets.sort((a, b) => a.position - b.position);
      setFieldSets(updatedFieldSets);
    } catch (error) {
      console.error('Error moving field set:', error);
      toast({
        title: "Error",
        description: "Failed to reorder field set",
        variant: "destructive"
      });
    }
  };

  // Get fields for a specific field set
  const getFieldsForSet = (fieldSetId: string) => {
    return fields.filter(field => field.field_set === fieldSetId);
  };

  // Get fields that don't belong to any set
  const getUnassignedFields = () => {
    return fields.filter(field => field.field_set === null);
  };

  // Render the form for editing a custom field
  const renderFieldForm = () => {
    if (!editingField) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingField.id ? 'Edit Field' : 'New Field'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field-name">Field Name*</Label>
              <Input 
                id="field-name"
                value={editingField.name}
                onChange={(e) => setEditingField({...editingField, name: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="field-type">Field Type*</Label>
              <Select 
                value={editingField.field_type} 
                onValueChange={(value) => setEditingField({
                  ...editingField, 
                  field_type: value as CustomFieldDefinition['field_type'],
                  // Reset options if switching away from select
                  options: value === 'select' ? (editingField.options || []) : null
                })}
              >
                <SelectTrigger id="field-type" className="mt-1">
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
          </div>
          
          {editingField.field_type === 'select' && (
            <div>
              <Label>Options (one per line)</Label>
              <textarea 
                className="w-full h-24 p-2 border border-gray-300 rounded-md mt-1"
                value={(editingField.options || []).join('\n')}
                onChange={(e) => setEditingField({
                  ...editingField, 
                  options: e.target.value.split('\n').filter(opt => opt.trim() !== '')
                })}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default-value">Default Value</Label>
              <Input 
                id="default-value"
                value={editingField.default_value || ''}
                onChange={(e) => setEditingField({...editingField, default_value: e.target.value || null})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="field-set">Field Set</Label>
              <Select 
                value={editingField.field_set || ''} 
                onValueChange={(value) => setEditingField({
                  ...editingField, 
                  field_set: value || null
                })}
              >
                <SelectTrigger id="field-set" className="mt-1">
                  <SelectValue placeholder="None (General)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General)</SelectItem>
                  {fieldSets.map(set => (
                    <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="is-required"
              checked={editingField.is_required}
              onCheckedChange={(checked) => setEditingField({...editingField, is_required: checked})}
            />
            <Label htmlFor="is-required">Required Field</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={() => setEditingField(null)}
          >
            Cancel
          </Button>
          <Button onClick={saveField}>
            Save Field
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render the form for editing a field set
  const renderFieldSetForm = () => {
    if (!editingFieldSet) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingFieldSet.id ? 'Edit Field Set' : 'New Field Set'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="field-set-name">Field Set Name*</Label>
            <Input 
              id="field-set-name"
              value={editingFieldSet.name}
              onChange={(e) => setEditingFieldSet({...editingFieldSet, name: e.target.value})}
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={() => setEditingFieldSet(null)}
          >
            Cancel
          </Button>
          <Button onClick={saveFieldSet}>
            Save Field Set
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Custom Fields Settings</h1>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Select 
          value={entityTypeFilter} 
          onValueChange={(value) => setEntityTypeFilter(value as 'contact' | 'matter' | 'task')}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact">Contacts</SelectItem>
            <SelectItem value="matter">Matters</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab('fields')}>
            <Settings className="w-4 h-4 mr-2" />
            Custom Fields
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('field-sets')}>
            <Settings className="w-4 h-4 mr-2" />
            Field Sets
          </Button>
        </div>
      </div>
      
      {activeTab === 'fields' && (
        <div>
          {editingField && renderFieldForm()}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Custom Fields</h2>
              <Button onClick={createNewField}>
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              {fields.length === 0 && !loading ? (
                <div className="p-6 text-center text-gray-500">
                  No custom fields defined. Click "Add Field" to create one.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Set</th>
                      <th className="p-3 text-center">Required</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field) => (
                      <tr key={field.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{field.name}</td>
                        <td className="p-3">{field.field_type.charAt(0).toUpperCase() + field.field_type.slice(1)}</td>
                        <td className="p-3">
                          {field.field_set ? 
                            fieldSets.find(set => set.id === field.field_set)?.name || field.field_set 
                            : <span className="text-gray-500">None</span>
                          }
                        </td>
                        <td className="p-3 text-center">
                          {field.is_required ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveField(field, 'up')}
                              disabled={
                                field.field_set
                                  ? getFieldsForSet(field.field_set)[0]?.id === field.id
                                  : getUnassignedFields()[0]?.id === field.id
                              }
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveField(field, 'down')}
                              disabled={
                                field.field_set
                                  ? getFieldsForSet(field.field_set)[getFieldsForSet(field.field_set).length - 1]?.id === field.id
                                  : getUnassignedFields()[getUnassignedFields().length - 1]?.id === field.id
                              }
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setEditingField(field)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'field-sets' && (
        <div>
          {editingFieldSet && renderFieldSetForm()}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Field Sets</h2>
              <Button onClick={createNewFieldSet}>
                <Plus className="w-4 h-4 mr-2" /> Add Field Set
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              {fieldSets.length === 0 && !loading ? (
                <div className="p-6 text-center text-gray-500">
                  No field sets defined. Click "Add Field Set" to create one.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-center">Fields</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldSets.map((fieldSet, index) => (
                      <tr key={fieldSet.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{fieldSet.name}</td>
                        <td className="p-3 text-center">
                          {getFieldsForSet(fieldSet.id).length}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveFieldSet(fieldSet, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => moveFieldSet(fieldSet, 'down')}
                              disabled={index === fieldSets.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setEditingFieldSet(fieldSet)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteFieldSet(fieldSet.id)}
                              disabled={getFieldsForSet(fieldSet.id).length > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
