import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  MoreHorizontal,
  Edit,
  Check,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from '@/hooks/use-toast';
import { EditTaskDialog } from './EditTaskDialog';
import { Task } from './TaskList';
import { useTaskTypes } from '@/contexts/TaskTypeContext';

interface TaskBoardProps {
  tasks: Task[];
  onCloseTask?: (taskId: string) => void;
}

export function TaskBoard({ tasks: initialTasks, onCloseTask }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { taskTypes } = useTaskTypes();
  
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  
  const activeTaskTypes = taskTypes
    .filter(type => type.active)
    .map(type => type.name);

  const statusList = ['Pending', 'In Progress', 'In Review', 'Completed'] as const;
  
  const tasksByStatus = tasks.reduce((acc: Record<string, Task[]>, task) => {
    const status = statusList.includes(task.status as any) ? task.status : 'Pending';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {});

  statusList.forEach(status => {
    if (!tasksByStatus[status]) {
      tasksByStatus[status] = [];
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return "text-red-600";
      case 'Normal':
        return "text-blue-600";
      case 'Low':
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const updatedTasks = [...tasks];
    
    const draggedTask = updatedTasks.find(task => task.id === draggableId);
    
    if (draggedTask) {
      const newStatus = destination.droppableId as Task['status'];
      const oldStatus = draggedTask.status;
      
      if (oldStatus !== newStatus) {
        draggedTask.status = newStatus;
        toast({
          title: "Task Updated",
          description: `Task moved to ${newStatus}`,
        });
      }
      
      setTasks(updatedTasks);
    }
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
    } else {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId ? { ...task, status: 'Completed' as const } : task
        )
      );
    }
    
    toast({
      title: "Task Completed",
      description: "Task marked as complete and removed from view",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-gray-500',
      'In Progress': 'bg-blue-500',
      'In Review': 'bg-purple-500',
      'Completed': 'bg-green-500',
      'Overdue': 'bg-red-500',
    };
    
    return colors[status] || 'bg-gray-500';
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusList.map((status) => (
            <div key={status} className="flex flex-col">
              <div className="flex items-center mb-3 pl-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
                <h3 className="font-medium text-gray-700">{status}</h3>
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {tasksByStatus[status]?.length || 0}
                </Badge>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    className={`bg-gray-50 rounded-lg p-2 flex-1 min-h-[50vh] ${
                      snapshot.isDraggingOver ? 'bg-gray-100' : ''
                    }`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {!tasksByStatus[status] || tasksByStatus[status].length === 0 ? (
                      <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-md bg-white mt-2">
                        <p className="text-gray-500 text-sm">No tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasksByStatus[status].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps} 
                                className={`border shadow-sm transition-shadow cursor-grab ${
                                  snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                } ${task.status === 'Overdue' ? 'border-red-300 bg-red-50' : ''}`}
                                onClick={() => handleEditTask(task)}
                              >
                                <CardHeader className="p-3 pb-0">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-medium">
                                      {task.name}
                                    </CardTitle>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 w-8 p-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditTask(task);
                                        }}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          handleCompleteTask(task.id);
                                        }}>
                                          <Check className="h-4 w-4 mr-2 text-green-500" />
                                          Complete Task
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-1">
                                  <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                                  
                                  <div className="flex justify-between items-center mt-2 text-xs">
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span className={task.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                                        {formatDate(task.dueDate)}
                                      </span>
                                    </div>
                                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-2 text-xs">
                                    <div className="flex items-center">
                                      <FileText className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span className="truncate max-w-[120px]">{task.matter}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      <EditTaskDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        onCompleteTask={handleCompleteTask}
      />
    </>
  );
}
