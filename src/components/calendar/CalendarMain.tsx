
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
}

export function CalendarMain({ view, date, events, onEventClick, onDayClick }: CalendarMainProps) {
  return (
    <div className="h-full overflow-hidden">
      <FullCalendarView
        view={view}
        date={date}
        events={events}
        onEventClick={onEventClick}
        onDateClick={onDayClick}
        onDateSelect={(start, end) => {
          // When user selects a time range, trigger day click with the start date
          onDayClick(start);
        }}
      />
    </div>
  );
}
