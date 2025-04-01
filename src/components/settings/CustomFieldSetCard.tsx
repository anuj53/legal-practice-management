
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CustomFieldDialog } from '@/components/contacts/CustomFieldDialog';
import { Badge } from '@/components/ui/badge';
import { CustomFieldCard } from './CustomFieldCard';
import { CustomFieldSet, mapToCustomFieldSet, mapToCustomFieldDefinition } from '@/types/customField';

interface CustomFieldSetCardProps {
  fieldSet: CustomFieldSet;
  onEdit: () => void;
  onRefresh: () => void;
}

export function CustomFieldSetCard({ fieldSet, onEdit, onRefresh }: CustomFieldSetCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Check if the set has any fields
      if (fieldSet.fields && fieldSet.fields.length > 0) {
        // First, get all field definition IDs in this set
        const fieldIds = fieldSet.fields.map((field) => field.id);
        
        // Delete all field values associated with these definitions
        if (fieldIds.length > 0) {
          const { error: deleteValuesError } = await supabase
            .from('custom_field_values')
            .delete()
            .in('definition_id', fieldIds);
            
          if (deleteValuesError) throw deleteValuesError;
        }
        
        // Delete all field definitions in this set
        const { error: deleteFieldsError } = await supabase
          .from('custom_field_definitions')
          .delete()
          .eq('field_set', fieldSet.id);
          
        if (deleteFieldsError) throw deleteFieldsError;
      }
      
      // Delete the field set from custom_field_sets table
      const { error } = await supabase
        .from('custom_field_sets')
        .delete()
        .eq('id', fieldSet.id);
        
      if (error) throw error;
      
      toast({
        title: "Field set deleted",
        description: "The field set has been removed successfully."
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting field set:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the field set.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleAddField = () => {
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogSuccess = async () => {
    // After adding a field, we need to refetch the field set data to update the UI
    try {
      // Fetch the fields for this specific field set
      const { data, error } = await supabase
        .from('custom_field_definitions')
        .select('*')
        .eq('field_set', fieldSet.id)
        .order('position');
        
      if (error) throw error;
      
      // Update the fieldSet.fields locally
      if (fieldSet && data) {
        fieldSet.fields = data.map(mapToCustomFieldDefinition);
      }
      
      // Trigger the parent component to refresh all data
      onRefresh();
    } catch (error) {
      console.error('Error refreshing fields after adding:', error);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">
              {fieldSet.name}
            </CardTitle>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>
                {fieldSet.fields?.length || 0} fields
              </span>
            </div>
          </CardContent>
          
          <CollapsibleContent>
            <div className="px-4 pb-4">
              {fieldSet.fields && fieldSet.fields.length > 0 ? (
                <div className="space-y-3">
                  {fieldSet.fields.map((field) => (
                    <CustomFieldCard key={field.id} field={field} onRefresh={onRefresh} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No fields in this set yet
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleAddField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field to Set
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the field set "{fieldSet.name}" and all fields within it.
              All associated data will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <CustomFieldDialog
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        entityType={fieldSet.entity_type}
        fieldSetId={fieldSet.id}
        onSuccess={handleFieldDialogSuccess}
      />
    </>
  );
}
