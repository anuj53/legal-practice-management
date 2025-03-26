
import React from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarView } from '@/components/calendar/CalendarHeader';
import { Event } from '@/utils/calendarUtils';

interface CalendarMainProps {
  view: CalendarView;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarMain({ view, date, events, onEventClick, onDayClick }: CalendarMainProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {view === 'day' && (
        <DayView
          date={date}
          events={events}
          onEventClick={onEventClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          date={date}
          events={events}
          onEventClick={onEventClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          date={date}
          events={events}
          onEventClick={onEventClick}
          onDayClick={onDayClick}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          date={date}
          events={events}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
