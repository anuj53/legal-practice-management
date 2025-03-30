
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  MoreHorizontal,
  Check,
  Edit
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

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  assignee: string;
  dueDate: string;
  taskType: string;
  timeEstimate: string;
  matter: string;
  isPrivate: boolean;
}

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks: initialTasks }: TaskBoardProps) {
  // State to track tasks after drag and drop operations
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Define status columns in order
  const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc: Record<string, Task[]>, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {});

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return "bg-green-500";
      case 'In Progress':
        return "bg-blue-500";
      case 'Pending':
        return "bg-yellow-500";
      case 'Overdue':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    // Return if dropped outside a droppable area or dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Make a copy of the tasks
    const updatedTasks = [...tasks];
    
    // Find the task that was dragged
    const draggedTask = updatedTasks.find(task => task.id === result.draggableId);
    
    if (draggedTask) {
      // Update the task's status to the new column
      const newStatus = destination.droppableId;
      const oldStatus = draggedTask.status;
      
      // If status changed, update it and show a toast
      if (oldStatus !== newStatus) {
        draggedTask.status = newStatus;
        toast({
          title: "Task Updated",
          description: `Task moved to ${newStatus}`,
        });
      }
      
      // Update the tasks state
      setTasks(updatedTasks);
    }
  };

  // Handle edit button click
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // Handle save after editing
  const handleSaveTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((status) => (
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
                                }`}
                                onDoubleClick={() => handleEditTask(task)}
                              >
                                <CardHeader className="p-3 pb-0">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-medium">
                                      {task.name}
                                    </CardTitle>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                          const updatedTask = {...task, status: 'Completed'};
                                          handleSaveTask(updatedTask);
                                          toast({
                                            title: "Task Completed",
                                            description: "Task marked as complete",
                                          });
                                        }}>
                                          <Check className="h-4 w-4 mr-2" />
                                          Mark as Complete
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Task
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
                                      <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center text-xs">
                                      <FileText className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span className="truncate max-w-[120px]">{task.matter}</span>
                                    </div>
                                    <div className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                                      {task.assignee.split(' ').map(name => name[0]).join('')}
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
      />
    </>
  );
}
