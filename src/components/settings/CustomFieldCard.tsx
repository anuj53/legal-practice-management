
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Calendar, Type, Hash, List, CheckSquare, Mail, Phone, Link } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CustomFieldDefinition } from '@/types/customField';
import { EditFieldDialog } from './EditFieldDialog';

interface CustomFieldCardProps {
  field: CustomFieldDefinition;
  onRefresh: () => void;
}

export function CustomFieldCard({ field, onRefresh }: CustomFieldCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getFieldTypeIcon = () => {
    switch (field.field_type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'number':
        return <Hash className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'select':
        return <List className="h-4 w-4" />;
      case 'checkbox':
        return <CheckSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };
  
  const getFieldTypeLabel = () => {
    switch (field.field_type) {
      case 'text':
        return 'Text';
      case 'number':
        return 'Number';
      case 'date':
        return 'Date';
      case 'select':
        return 'Dropdown';
      case 'checkbox':
        return 'Checkbox';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone';
      case 'url':
        return 'URL';
      default:
        return field.field_type;
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First check if any values exist for this field definition
      const { count, error: countError } = await supabase
        .from('custom_field_values')
        .select('*', { count: 'exact', head: true })
        .eq('definition_id', field.id);
        
      if (countError) throw countError;
      
      // If values exist, warn the user that they'll be deleted
      if (count && count > 0) {
        const { error: deleteValuesError } = await supabase
          .from('custom_field_values')
          .delete()
          .eq('definition_id', field.id);
          
        if (deleteValuesError) throw deleteValuesError;
      }
      
      // Delete the field definition
      const { error } = await supabase
        .from('custom_field_definitions')
        .delete()
        .eq('id', field.id);
        
      if (error) throw error;
      
      toast({
        title: "Field deleted",
        description: "The custom field has been removed successfully."
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the custom field.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-base">{field.name}</h3>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                {getFieldTypeIcon()}
                <span>{getFieldTypeLabel()}</span>
              </div>
            </div>
            {field.is_required && (
              <Badge variant="secondary">Required</Badge>
            )}
          </div>
          
          {field.default_value && (
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Default: </span>
              <span>{field.default_value}</span>
            </div>
          )}
          
          {field.field_type === 'select' && field.options && field.options.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Options:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {field.options.map((option, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the custom field "{field.name}" and all associated data.
              This action cannot be undone.
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
      
      <EditFieldDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        field={field}
        onSuccess={onRefresh}
      />
    </>
  );
}
