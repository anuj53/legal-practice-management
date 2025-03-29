
import React from 'react';
import { Plus, Settings, Edit2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/types/calendar';
import { CalendarList } from './CalendarList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarSidebarProps {
  myCalendars: Calendar[];
  otherCalendars: Calendar[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onEditCalendar?: (calendar: Calendar) => void;
}

export function CalendarSidebar({
  myCalendars,
  otherCalendars,
  onCalendarToggle,
  onEditCalendar
}: CalendarSidebarProps) {
  return (
    <div className="h-full bg-white shadow-sm overflow-hidden flex flex-col rounded-lg border border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-yorpro-600" />
          Calendar Filters
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <CalendarList
          title="My Calendars"
          calendars={myCalendars}
          category="my"
          onCalendarToggle={onCalendarToggle}
        />
        
        {otherCalendars.length > 0 && (
          <CalendarList
            title="Other Calendars"
            calendars={otherCalendars}
            category="other"
            onCalendarToggle={onCalendarToggle}
          />
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <Button 
          variant="gradient" 
          size="sm" 
          className="w-full justify-center gap-1 font-medium"
          onClick={() => onEditCalendar && myCalendars.length > 0 ? onEditCalendar(myCalendars[0]) : null}
        >
          <Settings className="h-3.5 w-3.5" />
          Manage Calendars
        </Button>
      </div>
    </div>
  );
}
