
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
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskTypes } from '@/contexts/TaskTypeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, Profile } from '@/types/workflow';

interface TaskTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  existingTaskTemplates: TaskTemplate[];
  editTask?: TaskTemplate;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Task name is required" }),
  description: z.string().optional(),
  priority: z.string().default("Normal"),
  isPrivate: z.boolean().default(false),
  taskType: z.string().optional(),
  timeEstimate: z.string().optional(),
  defaultAssignee: z.string().optional(),
  dueDateType: z.enum(["trigger_date", "after_task", "specific_date"]),
  dueDateOffset: z.number().int().default(0),
  dependsOnTaskId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function TaskTemplateDialog({ 
  open, 
  onOpenChange, 
  workflowId,
  existingTaskTemplates,
  editTask,
  onSuccess
}: TaskTemplateDialogProps) {
  const { taskTypes } = useTaskTypes();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  
  const activeTaskTypes = taskTypes.filter(type => type.active);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editTask?.name || '',
      description: editTask?.description || '',
      priority: editTask?.priority || 'Normal',
      isPrivate: editTask?.is_private || false,
      taskType: editTask?.task_type || '',
      timeEstimate: editTask?.time_estimate || '',
      defaultAssignee: editTask?.default_assignee || '',
      dueDateType: editTask?.due_date_type || 'trigger_date',
      dueDateOffset: editTask?.due_date_offset || 0,
      dependsOnTaskId: editTask?.depends_on_task_id || '',
    },
  });
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Reset form when edit task changes
  useEffect(() => {
    if (editTask) {
      form.reset({
        name: editTask.name,
        description: editTask.description || '',
        priority: editTask.priority,
        isPrivate: editTask.is_private,
        taskType: editTask.task_type || '',
        timeEstimate: editTask.time_estimate || '',
        defaultAssignee: editTask.default_assignee || '',
        dueDateType: editTask.due_date_type,
        dueDateOffset: editTask.due_date_offset || 0,
        dependsOnTaskId: editTask.depends_on_task_id || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        priority: 'Normal',
        isPrivate: false,
        taskType: '',
        timeEstimate: '',
        defaultAssignee: '',
        dueDateType: 'trigger_date',
        dueDateOffset: 0,
        dependsOnTaskId: '',
      });
    }
  }, [editTask, form]);

  async function onSubmit(data: FormData) {
    try {
      // Set position to next available position
      const position = existingTaskTemplates.length;
      
      if (editTask) {
        // Update existing task
        const { error } = await supabase
          .from('task_templates')
          .update({
            name: data.name,
            description: data.description || null,
            priority: data.priority,
            is_private: data.isPrivate,
            task_type: data.taskType || null,
            time_estimate: data.timeEstimate || null,
            default_assignee: data.defaultAssignee || null,
            due_date_type: data.dueDateType,
            due_date_offset: data.dueDateOffset,
            depends_on_task_id: data.dependsOnTaskId || null,
          })
          .eq('id', editTask.id);
        
        if (error) throw error;
        
        toast({
          title: "Task Template Updated",
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from('task_templates')
          .insert({
            workflow_id: workflowId,
            name: data.name,
            description: data.description || null,
            priority: data.priority,
            is_private: data.isPrivate,
            task_type: data.taskType || null,
            time_estimate: data.timeEstimate || null,
            default_assignee: data.defaultAssignee || null,
            due_date_type: data.dueDateType,
            due_date_offset: data.dueDateOffset,
            depends_on_task_id: data.dependsOnTaskId || null,
            position
          });
        
        if (error) throw error;
        
        toast({
          title: "Task Template Created",
          description: `${data.name} has been successfully added to the workflow template.`,
        });
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving task template:', error);
      toast({
        title: "Error",
        description: "Failed to save task template.",
        variant: "destructive"
      });
    }
  }

  // Handle conditional form fields based on due date type
  const dueDateType = form.watch('dueDateType');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task Template' : 'Add Task Template'}</DialogTitle>
          <DialogDescription>
            {editTask 
              ? 'Edit details for this task template in the workflow.' 
              : 'Add a new task template to this workflow.'}
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
                  <FormMessage />
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
                name="defaultAssignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Assignee</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Use workflow assignee</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty to use the workflow assignee
                    </FormDescription>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dueDateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select due date type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trigger_date">Based on trigger date</SelectItem>
                        <SelectItem value="after_task">After another task</SelectItem>
                        <SelectItem value="specific_date">Specific date after trigger</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              {dueDateType === 'trigger_date' && (
                <FormField
                  control={form.control}
                  name="dueDateOffset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days after trigger</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        0 means due on the trigger date
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              
              {dueDateType === 'after_task' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dependsOnTaskId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depends on Task</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || ''}
                          disabled={existingTaskTemplates.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a task" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {existingTaskTemplates.length === 0 ? (
                              <SelectItem value="" disabled>No tasks available</SelectItem>
                            ) : (
                              existingTaskTemplates
                                .filter(task => !editTask || task.id !== editTask.id)
                                .map(task => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                        {existingTaskTemplates.length === 0 && (
                          <FormDescription>
                            Add more tasks to create dependencies
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDateOffset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days after task</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {dueDateType === 'specific_date' && (
                <FormField
                  control={form.control}
                  name="dueDateOffset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days after trigger</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Private Task</FormLabel>
                    <FormDescription>
                      Only assignee and administrators will be able to see this task
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
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editTask ? 'Update Task' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
