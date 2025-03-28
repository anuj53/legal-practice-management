
import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
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
import { Calendar } from '@/types/calendar';
import { toast } from 'sonner';

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

  const handleCreateCalendar = () => {
    setIsCalendarFormOpen(true);
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
        is_public: isPublic
      });
      
      // Reset form
      setCalendarName('');
      setCalendarColor('#4caf50');
      setIsPublic(false);
      setIsCalendarFormOpen(false);
      
      toast.success('Calendar created successfully');
    }
  };

  const CalendarCheckbox = ({ calendar, category }: { calendar: CalendarItem, category: 'my' | 'other' }) => (
    <div className="calendar-list-item">
      <div 
        className={`calendar-checkbox ${calendar.checked ? 'bg-white' : 'bg-transparent'}`}
        style={{ borderColor: calendar.color }}
        onClick={() => onCalendarToggle(calendar.id, category)}
      >
        {calendar.checked && (
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: calendar.color }}></div>
        )}
      </div>
      <span className="flex-1 truncate">{calendar.name}</span>
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
          <Input placeholder="Search calendars" className="pl-3 pr-8 py-1 h-9 text-sm" />
        </div>
      </div>

      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>My calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {myCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="my" />
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>Other calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {otherCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="other" />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Calendar Creation Dialog */}
      <Dialog open={isCalendarFormOpen} onOpenChange={setIsCalendarFormOpen}>
        <DialogContent>
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
                <input 
                  type="checkbox"
                  id="is-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is-public" className="text-sm font-medium">
                  Make calendar public
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Public calendars are visible to other users of the system
              </p>
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
