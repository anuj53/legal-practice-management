
import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Edit, 
  MoreHorizontal, 
  Trash2, 
  FileText,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTaskDialog } from './EditTaskDialog';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  assignee: string;
  dueDate: string;
  taskType: string;
  timeEstimate: string;
  matter: string;
  isPrivate: boolean;
  status?: 'Pending' | 'Completed' | 'Overdue';
}

interface TaskListProps {
  tasks: Task[];
  onCloseTask?: (taskId: string) => void;
}

export function TaskList({ tasks: initialTasks, onCloseTask }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const getPriorityBadge = (priority: string) => {
    let className = "";
    
    switch (priority) {
      case 'High':
        className = "bg-red-100 text-red-800 hover:bg-red-100";
        break;
      case 'Normal':
        className = "bg-blue-100 text-blue-800 hover:bg-blue-100";
        break;
      case 'Low':
        className = "bg-green-100 text-green-800 hover:bg-green-100";
        break;
      default:
        className = "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
    
    return <Badge variant="outline" className={className}>{priority}</Badge>;
  };

  const getTaskTypeBadge = (taskType: string) => {
    let className = "";
    
    switch (taskType) {
      case 'Onboarding':
        className = "bg-purple-100 text-purple-800 hover:bg-purple-100";
        break;
      case 'Documentation':
        className = "bg-blue-100 text-blue-800 hover:bg-blue-100";
        break;
      case 'Follow Up':
        className = "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
        break;
      case 'Meeting':
        className = "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
        break;
      case 'Invoicing':
        className = "bg-amber-100 text-amber-800 hover:bg-amber-100";
        break;
      default:
        className = "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
    
    return <Badge variant="outline" className={className}>{taskType}</Badge>;
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
  };

  const handleCompleteTask = (taskId: string) => {
    if (onCloseTask) {
      onCloseTask(taskId);
      toast({
        title: "Task Completed",
        description: "Task marked as complete",
      });
    } else {
      // Fix here: Specify the exact status value that matches the Task interface
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: 'Completed' as const } : task
      );
      setTasks(updatedTasks);
      toast({
        title: "Task Completed",
        description: "Task marked as complete",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'Pending') return null;
    
    if (status === 'Overdue') {
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
    }
    
    if (status === 'Completed') {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    }
    
    return null;
  };

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Task Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No tasks found. Create a new task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                initialTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50" onDoubleClick={() => handleEditTask(task)}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{task.name}</span>
                        <span className="text-gray-500 text-sm">{task.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getTaskTypeBadge(task.taskType)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{task.matter}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Complete task"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Log time"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit task"
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
                            <DropdownMenuItem>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Timer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
        </CardContent>
      </Card>

      <EditTaskDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </>
  );
}
