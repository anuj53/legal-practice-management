import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Task } from './TaskList';
import { Filter, Search, X, CalendarIcon, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useTaskTypes } from '@/contexts/TaskTypeContext';

export interface TaskFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
  onSort: (sortConfig: SortConfig) => void;
}

export interface TaskFilters {
  priority: string[];
  taskType: string[];
  dueDate: Date | null;
  assignee: string[];
}

export interface SortConfig {
  field: keyof Task | '';
  direction: 'asc' | 'desc';
}

export function TaskFilters({ onSearch, onFilterChange, onSort }: TaskFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    priority: [],
    taskType: [],
    dueDate: null,
    assignee: []
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: '',
    direction: 'asc'
  });
  const [filtersActive, setFiltersActive] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  const { taskTypes } = useTaskTypes();
  
  // Priority options
  const priorities = ['High', 'Normal', 'Low'];
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: keyof TaskFilters, value: any) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
    
    // Count active filters for badge
    const count = 
      (updatedFilters.priority.length > 0 ? 1 : 0) +
      (updatedFilters.taskType.length > 0 ? 1 : 0) +
      (updatedFilters.dueDate !== null ? 1 : 0) +
      (updatedFilters.assignee.length > 0 ? 1 : 0);
    
    setActiveFilterCount(count);
    setFiltersActive(count > 0);
  };
  
  // Toggle a filter value
  const toggleFilter = (filterType: 'priority' | 'taskType' | 'assignee', value: string) => {
    const currentValues = filters[filterType];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
      
    handleFilterChange(filterType, newValues);
  };
  
  // Handle sort changes
  const handleSortChange = (field: keyof Task) => {
    const direction: 'asc' | 'desc' = 
      sortConfig.field === field && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
        
    const newSortConfig: SortConfig = { field, direction };
    setSortConfig(newSortConfig);
    onSort(newSortConfig);
  };
  
  // Reset all filters
  const resetFilters = () => {
    const resetedFilters = {
      priority: [],
      taskType: [],
      dueDate: null,
      assignee: []
    };
    setFilters(resetedFilters);
    onFilterChange(resetedFilters);
    setActiveFilterCount(0);
    setFiltersActive(false);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search tasks by name, description, or matter..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8" 
            onClick={() => {
              setSearchQuery('');
              onSearch('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Filters</h4>
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Priority filter */}
              <div>
                <h5 className="text-sm font-medium mb-2">Priority</h5>
                <div className="flex flex-wrap gap-1">
                  {priorities.map(priority => (
                    <Badge 
                      key={priority}
                      variant={filters.priority.includes(priority) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('priority', priority)}
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Task type filter */}
              <div>
                <h5 className="text-sm font-medium mb-2">Task Type</h5>
                <div className="flex flex-wrap gap-1">
                  {taskTypes
                    .filter(type => type.active)
                    .map(type => (
                      <Badge 
                        key={type.id}
                        variant={filters.taskType.includes(type.name) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('taskType', type.name)}
                      >
                        {type.name}
                      </Badge>
                    ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Due date filter */}
              <div>
                <h5 className="text-sm font-medium mb-2">Due Date</h5>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={filters.dueDate === new Date() ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleFilterChange('dueDate', new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        handleFilterChange('dueDate', tomorrow);
                      }}
                    >
                      Tomorrow
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        handleFilterChange('dueDate', nextWeek);
                      }}
                    >
                      Next 7 days
                    </Button>
                    <Button 
                      variant={filters.dueDate === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('dueDate', null)}
                    >
                      Any time
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                        onClick={() => handleFilterChange('dueDate', null)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDate ? format(filters.dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </div>
                    {filters.dueDate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleFilterChange('dueDate', null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Calendar
                    mode="single"
                    selected={filters.dueDate || undefined}
                    onSelect={(date) => handleFilterChange('dueDate', date)}
                    className="rounded-md border mt-2"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
              {sortConfig.field && (
                <Badge className="ml-1 bg-primary text-white">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="space-y-1">
              <Button 
                variant={sortConfig.field === 'name' ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleSortChange('name')}
              >
                Task Name {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Button>
              <Button 
                variant={sortConfig.field === 'priority' ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleSortChange('priority')}
              >
                Priority {sortConfig.field === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Button>
              <Button 
                variant={sortConfig.field === 'dueDate' ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleSortChange('dueDate')}
              >
                Due Date {sortConfig.field === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Button>
              <Button 
                variant={sortConfig.field === 'taskType' ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleSortChange('taskType')}
              >
                Task Type {sortConfig.field === 'taskType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
