import React, { useState, useEffect } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { 
  CustomFieldDefinition, 
  CustomFieldSet,
  SupabaseQueryResult
} from '@/types/customField';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CustomFieldDialog } from '@/components/contacts/CustomFieldDialog';
import { castQueryResult } from '@/utils/supabaseUtils';

export function CustomFieldsSettings() {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [fieldSets, setFieldSets] = useState<CustomFieldSet[]>([]);
  const [activeTab, setActiveTab] = useState('contact');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      
      // Fetch field sets
      const { data: setsData, error: setsError } = await supabaseClient
        .from('custom_field_sets')
        .select('*')
        .order('position', { ascending: true });
        
      if (setsError) throw new Error(setsError.message);
      
      // Fetch custom fields
      const { data: fieldsData, error: fieldsError } = await supabaseClient
        .from('custom_field_definitions')
        .select('*')
        .order('position', { ascending: true });
        
      if (fieldsError) throw new Error(fieldsError.message);
      
      setFieldSets(castQueryResult<CustomFieldSet[]>(setsData || []));
      setCustomFields(castQueryResult<CustomFieldDefinition[]>(fieldsData || []));
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom fields',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomFields();
  }, []);
  
  const handleCreateField = () => {
    setEditingField(null);
    setIsDialogOpen(true);
  };
  
  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = (shouldRefresh: boolean = false) => {
    setIsDialogOpen(false);
    if (shouldRefresh) {
      fetchCustomFields();
    }
  };
  
  const filterFieldsByEntityType = (entityType: string) => {
    return customFields.filter(field => field.entity_type === entityType);
  };
  
  const filterSetsByEntityType = (entityType: string) => {
    return fieldSets.filter(set => set.entity_type === entityType);
  };
  
  const getFieldsInSet = (setId: string, entityType: string) => {
    return customFields.filter(field => 
      field.field_set === setId && 
      field.entity_type === entityType
    );
  };
  
  const getStandaloneFields = (entityType: string) => {
    return customFields.filter(field => 
      !field.field_set && 
      field.entity_type === entityType
    );
  };
  
  const renderFieldType = (type: string) => {
    const typeMap: Record<string, string> = {
      'text': 'Text',
      'number': 'Number',
      'date': 'Date',
      'select': 'Dropdown',
      'checkbox': 'Checkbox',
      'email': 'Email',
      'phone': 'Phone',
      'url': 'URL'
    };
    return typeMap[type] || type;
  };
  
  const handleDeleteField = async (field: CustomFieldDefinition) => {
    if (!window.confirm(`Are you sure you want to delete the field "${field.name}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabaseClient
        .from('custom_field_definitions')
        .delete()
        .eq('id', field.id);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: 'Success',
        description: 'Field deleted successfully',
      });
      
      fetchCustomFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete field',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateFieldSet = async () => {
    const name = window.prompt('Enter field set name:');
    if (!name) return;
    
    try {
      const { data, error } = await supabaseClient
        .from('custom_field_sets')
        .insert({
          name,
          entity_type: activeTab,
          organization_id: 'default', // Replace with actual org ID in production
          position: fieldSets.filter(set => set.entity_type === activeTab).length + 1
        })
        .select();
        
      if (error) throw new Error(error.message);
      
      toast({
        title: 'Success',
        description: 'Field set created successfully',
      });
      
      fetchCustomFields();
    } catch (error) {
      console.error('Error creating field set:', error);
      toast({
        title: 'Error',
        description: 'Failed to create field set',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteFieldSet = async (setId: string, setName: string) => {
    if (!window.confirm(`Are you sure you want to delete the field set "${setName}"? All fields in this set will become standalone fields.`)) {
      return;
    }
    
    try {
      // First update all fields to remove the field_set reference
      const { error: updateError } = await supabaseClient
        .from('custom_field_definitions')
        .update({ field_set: null })
        .eq('field_set', setId);
        
      if (updateError) throw new Error(updateError.message);
      
      // Then delete the field set
      const { error: deleteError } = await supabaseClient
        .from('custom_field_sets')
        .delete()
        .eq('id', setId);
        
      if (deleteError) throw new Error(deleteError.message);
      
      toast({
        title: 'Success',
        description: 'Field set deleted successfully',
      });
      
      fetchCustomFields();
    } catch (error) {
      console.error('Error deleting field set:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete field set',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Custom Fields Management</h2>
        <div className="space-x-2">
          <Button onClick={handleCreateFieldSet}>
            Add Field Set
          </Button>
          <Button onClick={handleCreateField}>
            Add Custom Field
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contact">Contacts</TabsTrigger>
          <TabsTrigger value="matter">Matters</TabsTrigger>
          <TabsTrigger value="task">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Custom Fields</CardTitle>
              <CardDescription>
                Manage custom fields for contacts (individuals and companies)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4">Loading...</div>
              ) : (
                <div className="space-y-6">
                  {/* Field Sets */}
                  {filterSetsByEntityType('contact').length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Field Sets</h3>
                      <Accordion type="multiple" className="w-full">
                        {filterSetsByEntityType('contact').map((set) => {
                          const fieldsInSet = getFieldsInSet(set.id, 'contact');
                          return (
                            <AccordionItem key={set.id} value={set.id}>
                              <div className="flex items-center justify-between">
                                <AccordionTrigger>{set.name}</AccordionTrigger>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFieldSet(set.id, set.name);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                              <AccordionContent>
                                {fieldsInSet.length > 0 ? (
                                  <div className="space-y-2">
                                    {fieldsInSet.map((field) => (
                                      <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <div>
                                          <span className="font-medium">{field.name}</span>
                                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                          <span className="text-gray-500 ml-2">
                                            <Badge variant="outline">{renderFieldType(field.field_type)}</Badge>
                                          </span>
                                        </div>
                                        <div className="space-x-2">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleEditField(field)}
                                          >
                                            Edit
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDeleteField(field)}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No fields in this set</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  {/* Standalone Fields */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Standalone Fields</h3>
                    <div className="space-y-2">
                      {getStandaloneFields('contact').length > 0 ? (
                        getStandaloneFields('contact').map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div>
                              <span className="font-medium">{field.name}</span>
                              {field.is_required && <span className="text-red-500 ml-1">*</span>}
                              <span className="text-gray-500 ml-2">
                                <Badge variant="outline">{renderFieldType(field.field_type)}</Badge>
                              </span>
                            </div>
                            <div className="space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditField(field)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteField(field)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No standalone fields created</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleCreateField}>Add Custom Field</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="matter" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Matter Custom Fields</CardTitle>
              <CardDescription>
                Manage custom fields for legal matters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar implementation to contact but for matters */}
              <p className="text-gray-500">Configure matter custom fields here...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="task" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Custom Fields</CardTitle>
              <CardDescription>
                Manage custom fields for tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar implementation to contact but for tasks */}
              <p className="text-gray-500">Configure task custom fields here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog to create/edit custom fields */}
      <CustomFieldDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
        field={editingField}
        fieldSets={fieldSets}
        entityType={activeTab as 'contact' | 'matter' | 'task'}
      />
    </div>
  );
}
