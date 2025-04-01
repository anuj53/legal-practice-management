
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, Database, Users, FileText, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CustomFieldDialog } from '@/components/contacts/CustomFieldDialog';
import { Separator } from '@/components/ui/separator';
import { CustomFieldSetCard } from '@/components/settings/CustomFieldSetCard';
import { CustomFieldCard } from '@/components/settings/CustomFieldCard';
import { FieldSetDialog } from '@/components/settings/FieldSetDialog';
import { CustomFieldDefinition } from '@/types/customField';

export function CustomFieldsSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [activeEntity, setActiveEntity] = useState<'contact' | 'matter' | 'task'>('contact');
  const [searchTerm, setSearchTerm] = useState('');
  const [customFieldSets, setCustomFieldSets] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
  const [selectedFieldSet, setSelectedFieldSet] = useState<any | null>(null);
  
  // Fetch organization ID
  useEffect(() => {
    const fetchOrgId = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        if (data?.organization_id) {
          setOrganizationId(data.organization_id);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };
    
    fetchOrgId();
  }, [user]);
  
  // Fetch field sets and standalone fields
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!organizationId) return;
      
      try {
        setLoading(true);
        
        // Fetch field sets
        const { data: setsData, error: setsError } = await supabase
          .from('custom_field_sets')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('entity_type', activeEntity)
          .order('position');
        
        if (setsError) throw setsError;
        setCustomFieldSets(setsData || []);
        
        // Fetch standalone fields (fields with no set)
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('custom_field_definitions')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('entity_type', activeEntity)
          .is('field_set', null)
          .order('position');
        
        if (fieldsError) throw fieldsError;
        setCustomFields(fieldsData || []);
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
  }, [organizationId, activeEntity]);
  
  // Fetch fields for each field set
  useEffect(() => {
    const fetchFieldsForSets = async () => {
      if (!organizationId || customFieldSets.length === 0) return;
      
      try {
        const updatedSets = [...customFieldSets];
        
        for (const [index, set] of updatedSets.entries()) {
          const { data: fieldsData, error: fieldsError } = await supabase
            .from('custom_field_definitions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('field_set', set.id)
            .order('position');
          
          if (fieldsError) throw fieldsError;
          updatedSets[index].fields = fieldsData || [];
        }
        
        setCustomFieldSets(updatedSets);
      } catch (error) {
        console.error('Error fetching fields for sets:', error);
      }
    };
    
    fetchFieldsForSets();
  }, [organizationId, customFieldSets.length]);
  
  const handleCreateField = () => {
    setIsFieldDialogOpen(true);
  };
  
  const handleCreateFieldSet = () => {
    setSelectedFieldSet(null);
    setIsSetDialogOpen(true);
  };
  
  const handleRefresh = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    
    // Fetch field sets
    const { data: setsData, error: setsError } = await supabase
      .from('custom_field_sets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', activeEntity)
      .order('position');
    
    if (setsError) throw setsError;
    setCustomFieldSets(setsData || []);
    
    // Fetch standalone fields
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', activeEntity)
      .is('field_set', null)
      .order('position');
    
    if (fieldsError) throw fieldsError;
    setCustomFields(fieldsData || []);
    setLoading(false);
  };
  
  const handleEditSet = (fieldSet: any) => {
    setSelectedFieldSet(fieldSet);
    setIsSetDialogOpen(true);
  };
  
  // Filter fields by search term
  const filteredFields = customFields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter field sets by search term
  const filteredSets = customFieldSets.filter(set => 
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.fields && set.fields.some((field: any) => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Fields Management</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleCreateFieldSet}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Field Set
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={handleCreateField}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Field
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeEntity === 'contact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveEntity('contact')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Contacts
              </Button>
              <Button
                variant={activeEntity === 'matter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveEntity('matter')}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Matters
              </Button>
              <Button
                variant={activeEntity === 'task' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveEntity('task')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Tasks
              </Button>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Field sets section */}
              {filteredSets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Field Sets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSets.map((fieldSet) => (
                      <CustomFieldSetCard 
                        key={fieldSet.id} 
                        fieldSet={fieldSet} 
                        onEdit={() => handleEditSet(fieldSet)} 
                        onRefresh={handleRefresh}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Individual fields section */}
              {filteredFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Individual Fields
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFields.map((field) => (
                      <CustomFieldCard 
                        key={field.id} 
                        field={field} 
                        onRefresh={handleRefresh} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredSets.length === 0 && filteredFields.length === 0 && (
                <div className="text-center py-12">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">No custom fields found</h3>
                  <p className="text-muted-foreground">
                    Get started by creating a new custom field or field set.
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={handleCreateFieldSet}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Field Set
                    </Button>
                    <Button onClick={handleCreateField} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Field
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <CustomFieldDialog
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        entityType={activeEntity}
        onSuccess={handleRefresh}
      />
      
      <FieldSetDialog
        open={isSetDialogOpen}
        onOpenChange={setIsSetDialogOpen}
        entityType={activeEntity}
        fieldSet={selectedFieldSet}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
