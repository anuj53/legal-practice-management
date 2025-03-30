
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckSquare, 
  ClipboardList, 
  Filter, 
  ListChecks, 
  Plus, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { NewTaskDialog } from '@/components/tasks/NewTaskDialog';
import { TaskTypeDialog } from '@/components/tasks/TaskTypeDialog';
import { NewTaskListDialog } from '@/components/tasks/NewTaskListDialog';
import { TaskListsView } from '@/components/tasks/TaskListsView';

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskTypeOpen, setIsTaskTypeOpen] = useState(false);
  const [isNewTaskListOpen, setIsNewTaskListOpen] = useState(false);
  
  // Mock data for tasks and task lists
  const tasks = [
    {
      id: '1',
      name: 'Send monthly invoice to client',
      description: 'Download the invoice from the client\'s profile, verify, and send.',
      priority: 'High',
      assignee: 'John Doe',
      status: 'Pending',
      dueDate: '2025-01-02',
      taskType: 'Invoicing',
      timeEstimate: '15m',
      matter: 'A vs B client matter',
      isPrivate: true
    },
    {
      id: '2',
      name: 'Review contract draft',
      description: 'Check the updated contract and provide feedback',
      priority: 'Normal',
      assignee: 'John Doe',
      status: 'In Progress',
      dueDate: '2025-01-05',
      taskType: 'Documentation',
      timeEstimate: '45m',
      matter: 'Smith Contract',
      isPrivate: false
    },
    {
      id: '3',
      name: 'Schedule client meeting',
      description: 'Arrange for a follow-up meeting with the Johnson family',
      priority: 'Low',
      assignee: 'Sarah Lee',
      status: 'Completed',
      dueDate: '2024-12-28',
      taskType: 'Meeting',
      timeEstimate: '10m',
      matter: 'Johnson Estate',
      isPrivate: false
    },
    {
      id: '4',
      name: 'File court documents',
      description: 'Submit the prepared documents to the county court',
      priority: 'High',
      assignee: 'John Doe',
      status: 'Overdue',
      dueDate: '2024-12-30',
      taskType: 'Documentation',
      timeEstimate: '30m',
      matter: 'Williams v. City',
      isPrivate: false
    },
    {
      id: '5',
      name: 'Client onboarding',
      description: 'Complete onboarding process for new client',
      priority: 'Normal',
      assignee: 'Sarah Lee',
      status: 'Pending',
      dueDate: '2025-01-10',
      taskType: 'Onboarding',
      timeEstimate: '60m',
      matter: 'New Corp. LLC',
      isPrivate: false
    }
  ];

  // Function to filter tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by search query
    const matchesSearch = 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Filter by tab
    const matchesTab = 
      (activeTab === 'my-tasks' && task.assignee === 'John Doe') ||
      (activeTab === 'all-tasks') ||
      (activeTab === 'completed' && task.status === 'Completed') ||
      (activeTab === 'overdue' && task.status === 'Overdue');
      
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track all your case-related tasks</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsNewTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="outline" onClick={() => setIsTaskTypeOpen(true)}>
              <ListChecks className="mr-2 h-4 w-4" />
              Task Types
            </Button>
            <Button variant="outline" onClick={() => setIsNewTaskListOpen(true)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Task Lists
            </Button>
          </div>
        </div>

        {/* Filter and search section */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Sort
              </Button>
              <div className="border rounded-md flex">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('board')}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          defaultValue="my-tasks" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-4 w-full md:w-fit">
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-tasks" className="mt-4">
            {viewMode === 'list' ? (
              <TaskList tasks={filteredTasks} />
            ) : (
              <TaskBoard tasks={filteredTasks} />
            )}
          </TabsContent>
          
          <TabsContent value="all-tasks" className="mt-4">
            {viewMode === 'list' ? (
              <TaskList tasks={filteredTasks} />
            ) : (
              <TaskBoard tasks={filteredTasks} />
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {viewMode === 'list' ? (
              <TaskList tasks={filteredTasks} />
            ) : (
              <TaskBoard tasks={filteredTasks} />
            )}
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-4">
            {viewMode === 'list' ? (
              <TaskList tasks={filteredTasks} />
            ) : (
              <TaskBoard tasks={filteredTasks} />
            )}
          </TabsContent>
        </Tabs>

        {/* Task Lists Tab - Shown when user clicks on "Task Lists" */}
        <Tabs className="hidden">
          <TabsContent value="task-lists">
            <TaskListsView />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <NewTaskDialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
        <TaskTypeDialog open={isTaskTypeOpen} onOpenChange={setIsTaskTypeOpen} />
        <NewTaskListDialog open={isNewTaskListOpen} onOpenChange={setIsNewTaskListOpen} />
      </div>
    </div>
  );
}
