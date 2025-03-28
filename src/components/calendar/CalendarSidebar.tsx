
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CalendarList } from './CalendarList';
import { CalendarForm } from './CalendarForm';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  // State for calendar management
  const [isCalendarFormOpen, setIsCalendarFormOpen] = useState(false);
  const [calendarName, setCalendarName] = useState('');
  const [calendarColor, setCalendarColor] = useState('#4caf50');
  const [isPublic, setIsPublic] = useState(false);
  const [sharedWith, setSharedWith] = useState<CalendarShare[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle calendar creation
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

  // Filter calendars based on search query
  const filteredMyCalendars = myCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOtherCalendars = otherCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-l border-gray-200 bg-white h-full flex flex-col">
      <div className="p-4">
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

      <ScrollArea className="flex-1 px-4 pb-4">
        <CalendarList 
          title="My calendars" 
          calendars={filteredMyCalendars} 
          category="my" 
          onCalendarToggle={onCalendarToggle} 
        />

        <CalendarList 
          title="Other calendars" 
          calendars={filteredOtherCalendars} 
          category="other" 
          onCalendarToggle={onCalendarToggle} 
        />
      </ScrollArea>

      {/* Calendar Creation Dialog */}
      <Dialog open={isCalendarFormOpen} onOpenChange={setIsCalendarFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
            <DialogDescription>
              Add a new calendar to organize your events
            </DialogDescription>
          </DialogHeader>
          
          <CalendarForm 
            calendarName={calendarName}
            setCalendarName={setCalendarName}
            calendarColor={calendarColor}
            setCalendarColor={setCalendarColor}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            sharedWith={sharedWith}
            setSharedWith={setSharedWith}
          />
          
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
