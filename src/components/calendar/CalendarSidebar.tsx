
import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, CalendarShare } from '@/types/calendar';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  checked: boolean;
}

interface CalendarSidebarProps {
  myCalendars: CalendarItem[];
  otherCalendars: CalendarItem[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onCreateEvent: () => void;
  onCreateCalendar?: (calendar: Omit<Calendar, 'id'>) => void;
}

export function CalendarSidebar({ 
  myCalendars, 
  otherCalendars, 
  onCalendarToggle, 
  onCreateEvent,
  onCreateCalendar 
}: CalendarSidebarProps) {
  const [isCalendarFormOpen, setIsCalendarFormOpen] = useState(false);
  const [calendarName, setCalendarName] = useState('');
  const [calendarColor, setCalendarColor] = useState('#4caf50');
  const [isPublic, setIsPublic] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [sharedWith, setSharedWith] = useState<CalendarShare[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCalendar = () => {
    setIsCalendarFormOpen(true);
    // Reset form fields
    setCalendarName('');
    setCalendarColor('#4caf50');
    setIsPublic(false);
    setSharedWith([]);
  };

  const handleSaveCalendar = () => {
    if (!calendarName.trim()) {
      toast.error('Calendar name is required');
      return;
    }

    if (onCreateCalendar) {
      onCreateCalendar({
        name: calendarName.trim(),
        color: calendarColor,
        checked: true,
        isSelected: true,
        isUserCalendar: true,
        is_public: isPublic,
        sharedWith: sharedWith
      });
      
      // Reset form
      setCalendarName('');
      setCalendarColor('#4caf50');
      setIsPublic(false);
      setSharedWith([]);
      setIsCalendarFormOpen(false);
      
      toast.success('Calendar created successfully');
    }
  };

  const handleAddShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Email address is required');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (sharedWith.some(share => share.user_email === shareEmail.trim())) {
      toast.error('This user has already been added');
      return;
    }

    setSharedWith([
      ...sharedWith,
      {
        user_email: shareEmail.trim(),
        permission: sharePermission
      }
    ]);

    setShareEmail('');
    setSharePermission('view');
  };

  const handleRemoveShare = (email: string) => {
    setSharedWith(sharedWith.filter(share => share.user_email !== email));
  };

  // Filter calendars based on search query
  const filteredMyCalendars = myCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOtherCalendars = otherCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CalendarCheckbox = ({ calendar, category }: { calendar: CalendarItem, category: 'my' | 'other' }) => (
    <div className="flex items-center space-x-2 py-1.5 px-1 hover:bg-gray-100 rounded cursor-pointer"
         onClick={() => onCalendarToggle(calendar.id, category)}>
      <div className="flex items-center justify-center h-4 w-4 rounded border"
           style={{ 
             backgroundColor: calendar.checked ? calendar.color : 'transparent',
             borderColor: calendar.color 
           }}>
        {calendar.checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-3 w-3">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="text-sm flex-1 truncate">{calendar.name}</span>
    </div>
  );

  const availableColors = [
    '#4caf50', // Green
    '#2196f3', // Blue
    '#f44336', // Red
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#607d8b', // Blue Grey
  ];

  const permissionLabels = {
    view: 'View only',
    edit: 'Edit events',
    admin: 'Full control'
  };

  return (
    <div className="w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto custom-scrollbar">
      <div className="mb-6">
        <Button 
          onClick={onCreateEvent}
          variant="default" 
          className="w-full justify-start gap-2 mb-4 bg-yorpro-600 hover:bg-yorpro-700"
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
        
        <Button 
          onClick={handleCreateCalendar}
          variant="outline" 
          className="w-full justify-start gap-2 mb-4 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add New Calendar
        </Button>
        
        <div className="relative mb-4">
          <Input 
            placeholder="Search calendars" 
            className="pl-3 pr-8 py-1 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>My calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {filteredMyCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="my" />
          ))}
          {filteredMyCalendars.length === 0 && (
            <p className="text-xs text-gray-500 py-1">No calendars found</p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>Other calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {filteredOtherCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="other" />
          ))}
          {filteredOtherCalendars.length === 0 && (
            <p className="text-xs text-gray-500 py-1">No calendars found</p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Calendar Creation Dialog */}
      <Dialog open={isCalendarFormOpen} onOpenChange={setIsCalendarFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
            <DialogDescription>
              Add a new calendar to organize your events
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar Name</label>
              <Input 
                value={calendarName} 
                onChange={(e) => setCalendarName(e.target.value)}
                placeholder="Enter calendar name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar Color</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <div
                    key={color}
                    onClick={() => setCalendarColor(color)}
                    className={`w-6 h-6 rounded-full cursor-pointer ${
                      calendarColor === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id="is-public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  className="mr-2"
                />
                <label htmlFor="is-public" className="text-sm font-medium cursor-pointer">
                  Make calendar public
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Public calendars are visible to other users of the system
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium mb-3">Share with specific users</h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="col-span-2">
                  <Input
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={sharePermission}
                    onValueChange={(value: 'view' | 'edit' | 'admin') => setSharePermission(value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View only</SelectItem>
                      <SelectItem value="edit">Edit events</SelectItem>
                      <SelectItem value="admin">Full control</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={handleAddShare} type="button" variant="outline" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {sharedWith.length > 0 && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs text-gray-500">Shared with:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sharedWith.map((share, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                        <span className="flex-1">{share.user_email}</span>
                        <span className="text-xs text-gray-500">({permissionLabels[share.permission]})</span>
                        <X 
                          className="h-3 w-3 cursor-pointer ml-1" 
                          onClick={() => handleRemoveShare(share.user_email)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalendarFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCalendar}>
              Create Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
