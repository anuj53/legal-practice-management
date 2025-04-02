
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskTypes } from '@/contexts/TaskTypeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createTask } from './TaskService';
import { useAuth } from '@/hooks/useAuth';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function NewTaskDialog({ open, onOpenChange, onTaskCreated }: NewTaskDialogProps) {
  const { taskTypes } = useTaskTypes();
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [matters, setMatters] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeTaskTypes = taskTypes.filter(type => type.active);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from profiles table, current user:', user?.email);
        
        // First, add current user as a fallback if available
        if (user?.id) {
          const currentUserProfile = {
            id: user.id,
            first_name: user.email?.split('@')[0] || 'Current',
            last_name: 'User'
          };
          setUsers([currentUserProfile]);
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        
        console.log('Fetched profiles:', data);
        
        if (data && data.length > 0) {
          setUsers(data);
        } else {
          console.log('No profiles found in the database');
          // We already set current user as fallback above
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Only fetch users when dialog opens
    if (open) {
      fetchUsers();
    }
  }, [open, user]);
  
  // Fetch real matters from database
  useEffect(() => {
    const fetchMatters = async () => {
      try {
        console.log('Fetching matters from database');
        const { data, error } = await supabase
          .from('matters')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        console.log('Fetched matters:', data);
        
        if (data && data.length > 0) {
          setMatters(data);
        } else {
          console.log('No matters found in the database');
          // Set empty array if no matters found
          setMatters([]);
        }
      } catch (error) {
        console.error('Error fetching matters:', error);
        setMatters([]);
      }
    };
    
    // Only fetch matters when dialog opens
    if (open) {
      fetchMatters();
    }
  }, [open]);
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      priority: 'Normal',
      status: 'Pending',
      assignee: '',
      isPrivate: false,
      taskType: '',
      timeEstimate: '',
      matter: '',
      dueDate: undefined as Date | undefined,
    },
  });

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        priority: 'Normal',
        status: 'Pending',
        assignee: user?.id || '',
        isPrivate: false,
        taskType: '',
        timeEstimate: '',
        matter: '',
        dueDate: undefined,
      });
    }
  }, [open, form, user]);

  async function onSubmit(data: any) {
    console.log('Form submitted:', data);
    setIsSubmitting(true);
    
    try {
      // Format the data for the database
      const taskData = {
        name: data.name,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        assigned_to: data.assignee,
        is_private: data.isPrivate,
        task_type: data.taskType || null,
        time_estimate: data.timeEstimate || null,
        matter_id: data.matter || null,
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      
      // Use the task service to create the task
      await createTask(taskData);
      
      toast({
        title: "Task Created",
        description: `Task "${data.name}" has been successfully created.`,
      });
      
      form.reset();
      
      // Notify parent component that a task was created (if callback provided)
      if (onTaskCreated) {
        onTaskCreated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task for yourself or assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.length > 0 ? (
                          users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name || 'User'} {user.last_name || ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="current-user">Current User</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description" 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeTaskTypes.map(type => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeEstimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Estimate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 15m, 1h, 2h30m" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="matter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select matter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {matters.length > 0 ? (
                          matters.map(matter => (
                            <SelectItem key={matter.id} value={matter.id}>
                              {matter.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No matters available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
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
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Private Task</FormLabel>
                      <FormDescription>
                        Only you and the assignee will be able to see this task
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border-t pt-4">
              <FormLabel>Reminders</FormLabel>
              <div className="mt-2 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Add reminders to this task</span>
                  <Button type="button" size="sm" variant="outline">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Reminder
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit(async (data) => {
                    await onSubmit(data);
                    // Don't close the dialog, just reset the form
                    form.reset();
                  })();
                }}
              >
                Save and Create Another
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
