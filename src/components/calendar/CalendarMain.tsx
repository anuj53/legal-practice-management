
import React from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import { CalendarViewType } from '@/types/calendar';
import { CalendarEvent } from '@/types/calendar';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
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
