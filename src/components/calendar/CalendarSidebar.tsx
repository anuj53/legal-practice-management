
import React from 'react';
import { Plus, Settings, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/types/calendar';
import { CalendarList } from './CalendarList';

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
    <div className="h-full bg-white shadow-sm p-4 overflow-auto">
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
    </div>
  );
}
