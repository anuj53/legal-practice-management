
import React from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarView } from '@/components/calendar/CalendarHeader';
import { CalendarEvent } from '@/types/calendar';

interface CalendarMainProps {
  view: CalendarView;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarMain({ view, date, events, onEventClick, onDayClick }: CalendarMainProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {view === 'day' && (
        <DayView
          currentDate={date}
          events={events}
          onEventClick={onEventClick}
          onTimeSlotClick={onDayClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={date}
          events={events}
          onEventClick={onEventClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={date}
          events={events}
          onSelectDate={onDayClick}
          onEventClick={onEventClick}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          currentDate={date}
          events={events}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
