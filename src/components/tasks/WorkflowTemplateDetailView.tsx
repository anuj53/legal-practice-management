import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  User 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TaskTemplateDialog } from './TaskTemplateDialog';
import { AssignWorkflowDialog } from './AssignWorkflowDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowTemplate, TaskTemplate } from '@/types/workflow';

interface WorkflowTemplateDetailViewProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowTemplateDetailView({ 
  templateId, 
  open, 
  onOpenChange 
}: WorkflowTemplateDetailViewProps) {
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [tasks, setTasks] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const fetchTemplateDetails = async () => {
    setIsLoading(true);
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError) throw templateError;
      setTemplate(templateData);
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('task_templates')
        .select(`
          id,
          name,
          description,
          priority,
          is_private,
          task_type,
          time_estimate,
          default_assignee,
          due_date_type,
          due_date_offset,
          depends_on_task_id,
          position,
          workflow_id,
          profiles(first_name, last_name)
        `)
        .eq('workflow_id', templateId)
        .order('position', { ascending: true });
      
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching template details:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow template details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open && templateId) {
      fetchTemplateDetails();
    }
  }, [open, templateId]);
  
  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: TaskTemplate) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', taskToDelete);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      
      toast({
        title: "Task Deleted",
        description: "Task template has been removed from this workflow.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task template.",
        variant: "destructive"
      });
    } finally {
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const moveTask = async (taskId: string, direction: 'up' | 'down') => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    
    try {
      const currentTask = tasks[taskIndex];
      const targetTask = tasks[newIndex];
      
      const updates = [
        supabase
          .from('task_templates')
          .update({ position: targetTask.position })
          .eq('id', currentTask.id),
          
        supabase
          .from('task_templates')
          .update({ position: currentTask.position })
          .eq('id', targetTask.id)
      ];
      
      await Promise.all(updates);
      
      const newTasks = [...tasks];
      [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];
      
      newTasks.forEach((task, index) => {
        task.position = index;
      });
      
      setTasks(newTasks);
      
      toast({
        title: "Task Moved",
        description: `Task moved ${direction}.`,
      });
    } catch (error) {
      console.error(`Error moving task ${direction}:`, error);
      toast({
        title: "Error",
        description: `Failed to move task ${direction}.`,
        variant: "destructive"
      });
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return "bg-red-50 text-red-700";
      case 'Normal':
        return "bg-blue-50 text-blue-700";
      case 'Low':
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };
  
  const getDueDateText = (task: any) => {
    switch (task.due_date_type) {
      case 'trigger_date':
        if (task.due_date_offset === 0) {
          return "On trigger date";
        } else {
          return `${task.due_date_offset} day${task.due_date_offset !== 1 ? 's' : ''} after trigger`;
        }
      case 'after_task':
        const dependentTask = tasks.find(t => t.id === task.depends_on_task_id);
        return dependentTask 
          ? `${task.due_date_offset} day${task.due_date_offset !== 1 ? 's' : ''} after "${dependentTask.name}"`
          : "After another task";
      case 'specific_date':
        return `${task.due_date_offset} day${task.due_date_offset !== 1 ? 's' : ''} after trigger`;
      default:
        return "Not specified";
    }
  };
  
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.task_type && task.task_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isLoading ? 'Loading...' : template?.name || 'Workflow Template'}
          </DialogTitle>
        </DialogHeader>
        
        {!isLoading && template && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  Assign Workflow
                </Button>
                <Button variant="outline" onClick={handleAddTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        {searchQuery 
                          ? "No tasks match your search criteria" 
                          : "No tasks in this workflow template yet. Click 'Add Task' to create your first task."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task, index) => (
                      <TableRow key={task.id} className="group hover:bg-gray-50">
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => moveTask(task.id, 'up')}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === tasks.length - 1}
                              onClick={() => moveTask(task.id, 'down')}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{task.name}</span>
                              <Badge 
                                variant="outline" 
                                className={`${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <span className="text-xs text-gray-500 mt-1">{task.description}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                            <span className="text-sm">{getDueDateText(task)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.default_assignee ? (
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                              <span className="text-sm">
                                {task.profiles?.first_name} {task.profiles?.last_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Use workflow assignee</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.is_private ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Private
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">Visible to all</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.task_type ? (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700">
                              {task.task_type}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.time_estimate ? (
                            <span className="text-sm">{task.time_estimate}</span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setTaskToDelete(task.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <TaskTemplateDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          workflowId={templateId}
          existingTaskTemplates={tasks}
          editTask={editingTask}
          onSuccess={fetchTemplateDetails}
        />
        
        <AssignWorkflowDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          workflowId={templateId}
          workflowName={template?.name}
          tasks={tasks}
        />
        
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task template? This action cannot be undone.
                This may affect task dependencies in this workflow.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
