
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, TaskTemplate } from '@/types/workflow';

interface AssignWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  workflowName?: string;
  tasks: TaskTemplate[];
}

const formSchema = z.object({
  assigneeId: z.string().min(1, { message: "Assignee is required" }),
  assignAllToOne: z.boolean().default(false),
  notifyAssignees: z.boolean().default(false),
  matterId: z.string().optional(),
  triggerDate: z.date({ required_error: "Trigger date is required" }),
});

type FormData = z.infer<typeof formSchema>;

export function AssignWorkflowDialog({
  open,
  onOpenChange,
  workflowId,
  workflowName,
  tasks
}: AssignWorkflowDialogProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assigneeId: '',
      assignAllToOne: false,
      notifyAssignees: false,
      matterId: '',
      triggerDate: new Date(),
    },
  });
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        assigneeId: '',
        assignAllToOne: false,
        notifyAssignees: false,
        matterId: '',
        triggerDate: new Date(),
      });
    }
  }, [open, form]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        
        // Cast the data to match the Profile interface
        setUsers((data || []) as Profile[]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Simulate fetching matters (will need to be replaced with real data)
    const fetchMatters = async () => {
      // This is a placeholder. In a real app, you would fetch matters from your database.
      setMatters([
        { id: 'matter1', name: 'Johnson Estate Planning' },
        { id: 'matter2', name: 'Smith v. Jones Litigation' },
        { id: 'matter3', name: 'ABC Corp Acquisition' },
      ]);
    };
    
    if (open) {
      fetchUsers();
      fetchMatters();
    }
  }, [open]);
  
  async function onSubmit(data: FormData) {
    try {
      // This is where you would create actual tasks based on the workflow template
      // For now, we'll just simulate the process with a success message
      
      console.log('Assigning workflow with data:', data);
      
      // Placeholder for task creation logic
      // In a real implementation, you would:
      // 1. For each task in the template:
      //    a. Create a new actual task
      //    b. Set the due date based on template rules and trigger date
      //    c. Assign to proper user (either the workflow assignee or task-specific assignee)
      //    d. Link to the matter if specified
      
      toast({
        title: "Workflow Assigned",
        description: `Tasks from "${workflowName}" have been assigned successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning workflow template:', error);
      toast({
        title: "Error",
        description: "Failed to assign workflow tasks.",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Assign Workflow Template</DialogTitle>
          <DialogDescription>
            Assign tasks from "{workflowName}" to a user or team members.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a valid firm user.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignAllToOne"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Assign all tasks in this list to this assignee
                    </FormLabel>
                    <FormDescription>
                      Override any task-specific assignee settings
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notifyAssignees"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Notify task assignees via email
                    </FormLabel>
                    <FormDescription>
                      Send email notifications to all assigned users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="matterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matter</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a matter (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No matter</SelectItem>
                      {matters.map(matter => (
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link these tasks to a specific legal matter
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="triggerDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Trigger date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Base date for calculating task due dates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign Tasks</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
