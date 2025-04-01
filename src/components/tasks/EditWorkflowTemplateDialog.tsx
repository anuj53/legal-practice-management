
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowTemplate } from '@/types/workflow';

interface EditWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  template: WorkflowTemplate;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Workflow template name is required" }),
  description: z.string().optional(),
  practiceArea: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditWorkflowTemplateDialog({ 
  open, 
  onOpenChange,
  onSuccess,
  template
}: EditWorkflowTemplateDialogProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description || '',
      practiceArea: template.practice_area || '',
    },
  });

  async function onSubmit(data: FormData) {
    try {
      // Update workflow template in database
      const { error } = await supabase
        .from('workflow_templates')
        .update({
          name: data.name,
          description: data.description || null,
          practice_area: data.practiceArea || null,
        })
        .eq('id', template.id);
      
      if (error) throw error;
      
      toast({
        title: "Workflow Template Updated",
        description: `${data.name} has been successfully updated.`,
      });
      
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating workflow template:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow template.",
        variant: "destructive"
      });
    }
  }

  // Close handler that resets the form
  const handleClose = () => {
    form.reset({
      name: template.name,
      description: template.description || '',
      practiceArea: template.practice_area || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workflow Template</DialogTitle>
          <DialogDescription>
            Update the details of your workflow template.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workflow template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description of this workflow template" 
                      className="resize-none min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="practiceArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practice Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select practice area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="corporate">Corporate Law</SelectItem>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="intellectual-property">Intellectual Property</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
