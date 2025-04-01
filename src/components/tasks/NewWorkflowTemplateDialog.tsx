
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

interface NewWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workflowId: string) => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Workflow template name is required" }),
  description: z.string().optional(),
  practiceArea: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function NewWorkflowTemplateDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: NewWorkflowTemplateDialogProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      practiceArea: '',
    },
  });

  async function onSubmit(data: FormData, action: 'close' | 'add-tasks') {
    try {
      // Insert workflow template into database
      const { data: workflowData, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: data.name,
          description: data.description || null,
          practice_area: data.practiceArea || null,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Workflow Template Created",
        description: `${data.name} has been successfully created.`,
      });
      
      if (action === 'close') {
        onOpenChange(false);
        if (onSuccess) onSuccess(workflowData.id);
      } else if (action === 'add-tasks' && onSuccess) {
        onOpenChange(false);
        onSuccess(workflowData.id);
      }
      
      form.reset();
    } catch (error) {
      console.error('Error creating workflow template:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow template.",
        variant: "destructive"
      });
    }
  }

  // Close handler that resets the form
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workflow Template</DialogTitle>
          <DialogDescription>
            Create a template for recurring sets of tasks that can be assigned to matters or users.
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
                  form.handleSubmit((data) => onSubmit(data, 'close'))();
                }}
              >
                Save and Close
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  form.handleSubmit((data) => onSubmit(data, 'add-tasks'))();
                }}
              >
                Save and Add Tasks
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
