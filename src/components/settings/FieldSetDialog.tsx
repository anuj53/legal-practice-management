
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CustomFieldSet } from '@/types/customField';

interface FieldSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'contact' | 'matter' | 'task';
  fieldSet?: CustomFieldSet;
  onSuccess?: () => void;
}

export function FieldSetDialog({
  open,
  onOpenChange,
  entityType,
  fieldSet,
  onSuccess
}: FieldSetDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  
  // If fieldSet is provided, it's an edit operation
  const isEditing = !!fieldSet;
  
  useEffect(() => {
    if (fieldSet) {
      setName(fieldSet.name || '');
    } else {
      setName('');
    }
  }, [fieldSet]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create field sets.",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Field set name is required.",
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
      
      // Add custom_field_sets table to Supabase
      if (isEditing) {
        // Update existing field set
        const { error } = await supabase
          .from('custom_field_sets')
          .update({
            name: name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', fieldSet.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Field set updated successfully."
        });
      } else {
        // For field sets, we need to check the position
        const { data: fieldSets } = await supabase
          .from('custom_field_sets')
          .select('position')
          .eq('organization_id', profileData.organization_id)
          .eq('entity_type', entityType)
          .order('position', { ascending: false })
          .limit(1);
          
        const nextPosition = (fieldSets && fieldSets.length > 0 && fieldSets[0]?.position != null)
          ? (fieldSets[0].position + 1)
          : 0;
        
        // Create new field set
        const { error } = await supabase
          .from('custom_field_sets')
          .insert({
            organization_id: profileData.organization_id,
            name: name.trim(),
            entity_type: entityType,
            position: nextPosition
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Field set created successfully."
        });
      }
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error with field set:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save field set.",
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
          <DialogTitle>{isEditing ? "Edit Field Set" : "Create Field Set"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update details for this field set." 
              : `Add a new field set for ${entityType === 'contact' ? 'contacts' : entityType === 'matter' ? 'matters' : 'tasks'}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Field Set Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Personal Information"
              required
            />
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
