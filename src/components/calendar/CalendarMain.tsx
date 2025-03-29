
import React from 'react';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import { CalendarViewType } from '@/types/calendar';
import { Event } from '@/utils/calendarUtils';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
  onCreateEvent?: (start: Date, end: Date) => void;
  showFullDay: boolean; // Add the prop to the interface
}

export function CalendarMain({ 
  view, 
  date, 
  events, 
  onEventClick, 
  onDayClick,
  onCreateEvent,
  showFullDay
}: CalendarMainProps) {
  return (
    <div className="h-full overflow-hidden">
      <FullCalendarView
        view={view}
        date={date}
        events={events}
        onEventClick={onEventClick}
        onDateClick={null} // Set to null to disable day click behavior
        onCreateEvent={onCreateEvent}
        showFullDay={showFullDay} // Pass the prop to FullCalendarView
        onDateSelect={(start, end) => {
          // When user selects a time range and no create function is provided,
          // trigger day click with the start date (old behavior)
          if (!onCreateEvent) {
            onDayClick(start);
          }
        }}
      />
    </div>
  );
}
