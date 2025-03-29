
import React, { useMemo } from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarViewType, Event } from '@/types/calendar';
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function CalendarMain({ view, date, events, onEventClick, onTimeSlotClick }: CalendarMainProps) {
  // Calculate view start and end dates based on current view
  const viewDates = useMemo(() => {
    let viewStart: Date;
    let viewEnd: Date;
    
    switch (view) {
      case 'day':
        viewStart = startOfDay(date);
        viewEnd = endOfDay(date);
        break;
      case 'week':
        viewStart = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
        viewEnd = endOfWeek(date, { weekStartsOn: 1 }); // End on Sunday
        break;
      case 'month':
        viewStart = startOfMonth(date);
        viewEnd = endOfMonth(date);
        break;
      case 'agenda':
        // For agenda view, show a wider range
        viewStart = startOfDay(date);
        viewEnd = endOfDay(addDays(date, 30)); // Show next 30 days
        break;
      default:
        viewStart = startOfDay(date);
        viewEnd = endOfDay(date);
    }
    
    return { viewStart, viewEnd };
  }, [view, date]);

  // Debug log for events
  console.log(`Rendering ${view} view with ${events.length} events`, {
    date: date,
    viewStart: viewDates.viewStart,
    viewEnd: viewDates.viewEnd,
    events: events
  });

  return (
    <div className="h-full overflow-hidden">
      {view === 'day' && (
        <DayView
          currentDate={date}
          events={events}
          onEventClick={onEventClick}
          onTimeSlotClick={onTimeSlotClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={date}
          events={events}
          onEventClick={onEventClick}
          onTimeSlotClick={onTimeSlotClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={date}
          events={events}
          onSelectDate={onTimeSlotClick}
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
