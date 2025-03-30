
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Task } from './TaskList';
import { useTaskTypes } from '@/contexts/TaskTypeContext';
import { Check } from 'lucide-react';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
  onCompleteTask?: (taskId: string) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  priority: z.enum(["High", "Normal", "Low"]),
  status: z.enum(["Pending", "In Progress", "In Review", "Completed", "Overdue"]),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taskType: z.string().min(1, "Task type is required"),
  timeEstimate: z.string().optional(),
  matter: z.string().min(1, "Matter is required"),
  isPrivate: z.boolean().default(false)
});

export function EditTaskDialog({ open, onOpenChange, task, onSave, onCompleteTask }: EditTaskDialogProps) {
  const { taskTypes } = useTaskTypes();
  const activeTaskTypes = taskTypes.filter(type => type.active);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: task?.name || "",
      description: task?.description || "",
      priority: (task?.priority || "Normal") as "High" | "Normal" | "Low",
      status: (task?.status || "Pending") as "Pending" | "In Progress" | "In Review" | "Completed" | "Overdue",
      assignee: task?.assignee || "",
      dueDate: task?.dueDate || "",
      taskType: task?.taskType || "",
      timeEstimate: task?.timeEstimate || "",
      matter: task?.matter || "",
      isPrivate: task?.isPrivate || false
    }
  });

  React.useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description,
        priority: task.priority as "High" | "Normal" | "Low",
        status: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate,
        taskType: task.taskType,
        timeEstimate: task.timeEstimate,
        matter: task.matter,
        isPrivate: task.isPrivate
      });
    }
  }, [task, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!task) return;
    
    const updatedTask: Task = {
      ...task,
      ...values
    };
    
    onSave(updatedTask);
    onOpenChange(false);
    toast({
      title: "Task Updated",
      description: "Task details have been saved successfully.",
    });
  };

  const handleCompleteTask = () => {
    if (task && onCompleteTask) {
      onCompleteTask(task.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} />
                  </FormControl>
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
                      placeholder="Enter task description" 
                      className="resize-none h-20" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                        <SelectItem value="Overdue">Overdue</SelectItem>
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
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignee name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g. 2h, 30m" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="matter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matter</FormLabel>
                  <FormControl>
                    <Input placeholder="Associated matter" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <div className="flex gap-2 w-full justify-between sm:justify-end">
                {onCompleteTask && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center" 
                    onClick={handleCompleteTask}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Journey complete
                  </Button>
                )}
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
