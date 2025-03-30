import React, { useState, useMemo } from 'react';
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
  Plus, 
  ListChecks
} from 'lucide-react';
import { TaskList, Task } from '@/components/tasks/TaskList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { NewTaskDialog } from '@/components/tasks/NewTaskDialog';
import { TaskTypeDialog } from '@/components/tasks/TaskTypeDialog';
import { NewTaskListDialog } from '@/components/tasks/NewTaskListDialog';
import { TaskListsView } from '@/components/tasks/TaskListsView';
import { TaskTypeProvider } from '@/contexts/TaskTypeContext';
import { TaskFilters, TaskFilters as TaskFiltersType, SortConfig } from '@/components/tasks/TaskFilters';

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskTypeOpen, setIsTaskTypeOpen] = useState(false);
  const [isNewTaskListOpen, setIsNewTaskListOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    priority: [],
    taskType: [],
    dueDate: null,
    assignee: []
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: '',
    direction: 'asc'
  });
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Send monthly invoice to client',
      description: 'Download the invoice from the client\'s profile, verify, and send.',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2025-01-02',
      taskType: 'Invoicing',
      timeEstimate: '15m',
      matter: 'A vs B client matter',
      isPrivate: true,
      status: 'Pending'
    },
    {
      id: '2',
      name: 'Review contract draft',
      description: 'Check the updated contract and provide feedback',
      priority: 'Normal',
      assignee: 'John Doe',
      dueDate: '2025-01-05',
      taskType: 'Documentation',
      timeEstimate: '45m',
      matter: 'Smith Contract',
      isPrivate: false,
      status: 'Pending'
    },
    {
      id: '3',
      name: 'Schedule client meeting',
      description: 'Arrange for a follow-up meeting with the Johnson family',
      priority: 'Low',
      assignee: 'Sarah Lee',
      dueDate: '2024-12-28',
      taskType: 'Meeting',
      timeEstimate: '10m',
      matter: 'Johnson Estate',
      isPrivate: false,
      status: 'Pending'
    },
    {
      id: '4',
      name: 'File court documents',
      description: 'Submit the prepared documents to the county court',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-12-30',
      taskType: 'Documentation',
      timeEstimate: '30m',
      matter: 'Williams v. City',
      isPrivate: false,
      status: 'Overdue'
    },
    {
      id: '5',
      name: 'Client onboarding',
      description: 'Complete onboarding process for new client',
      priority: 'Normal',
      assignee: 'Sarah Lee',
      dueDate: '2025-01-10',
      taskType: 'Onboarding',
      timeEstimate: '60m',
      matter: 'New Corp. LLC',
      isPrivate: false,
      status: 'Pending'
    }
  ]);

  const handleCloseTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'Completed' } 
        : task
    ));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery ? 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.matter.toLowerCase().includes(searchQuery.toLowerCase()) :
        true;
      
      const matchesTab = 
        (activeTab === 'my-tasks' && task.assignee === 'John Doe' && task.status !== 'Completed') ||
        (activeTab === 'all-tasks' && task.status !== 'Completed');
      
      const matchesPriority = filters.priority.length === 0 || 
        filters.priority.includes(task.priority);
      
      const matchesTaskType = filters.taskType.length === 0 || 
        filters.taskType.includes(task.taskType);
      
      const matchesDueDate = !filters.dueDate || 
        new Date(task.dueDate).toDateString() === filters.dueDate.toDateString();
      
      return matchesSearch && matchesTab && matchesPriority && matchesTaskType && matchesDueDate;
    }).sort((a, b) => {
      if (!sortConfig.field) return 0;
      
      const field = sortConfig.field;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (field === 'dueDate') {
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * direction;
      }
      
      if (field === 'priority') {
        const priorityValue = { 'High': 3, 'Normal': 2, 'Low': 1 };
        return (priorityValue[a.priority as keyof typeof priorityValue] - 
                priorityValue[b.priority as keyof typeof priorityValue]) * direction;
      }
      
      return a[field].toString().localeCompare(b[field].toString()) * direction;
    });
  }, [tasks, searchQuery, activeTab, filters, sortConfig]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  const handleSort = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
  };

  return (
    <TaskTypeProvider>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
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

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <TaskFilters 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onSort={handleSort}
              />
              <div className="border rounded-md flex ml-2">
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

          <Tabs 
            defaultValue="my-tasks" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 w-full md:w-fit">
              <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-tasks" className="mt-4">
              {viewMode === 'list' ? (
                <TaskList tasks={filteredTasks} onCloseTask={handleCloseTask} />
              ) : (
                <TaskBoard tasks={filteredTasks} onCloseTask={handleCloseTask} />
              )}
            </TabsContent>
            
            <TabsContent value="all-tasks" className="mt-4">
              {viewMode === 'list' ? (
                <TaskList tasks={filteredTasks} onCloseTask={handleCloseTask} />
              ) : (
                <TaskBoard tasks={filteredTasks} onCloseTask={handleCloseTask} />
              )}
            </TabsContent>
          </Tabs>

          <Tabs className="hidden">
            <TabsContent value="task-lists">
              <TaskListsView />
            </TabsContent>
          </Tabs>

          <NewTaskDialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
          <TaskTypeDialog open={isTaskTypeOpen} onOpenChange={setIsTaskTypeOpen} />
          <NewTaskListDialog open={isNewTaskListOpen} onOpenChange={setIsNewTaskListOpen} />
        </div>
      </div>
    </TaskTypeProvider>
  );
}
