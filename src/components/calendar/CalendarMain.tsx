
import React, { useMemo } from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarViewType } from '@/types/calendar';
import { CalendarEvent } from '@/types/calendar';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';
import { generateRecurringEventInstances } from '@/utils/recurrenceUtils';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarMain({ view, date, events, onEventClick, onDayClick }: CalendarMainProps) {
  // Process recurring events for the current view
  const processedEvents = useMemo(() => {
    // Create a copy of regular events
    let allEvents = [...events];
    
    // Find recurring events
    const recurringEvents = events.filter(event => event.isRecurring && event.recurrencePattern);
    
    if (recurringEvents.length > 0) {
      // For each view, determine the appropriate date range for recurring events
      let rangeStart: Date, rangeEnd: Date;
      
      switch (view) {
        case 'week':
          rangeStart = startOfWeek(date, { weekStartsOn: 0 });
          rangeEnd = endOfWeek(date, { weekStartsOn: 0 });
          break;
        case 'day':
          rangeStart = new Date(date);
          rangeStart.setHours(0, 0, 0, 0);
          rangeEnd = new Date(date);
          rangeEnd.setHours(23, 59, 59, 999);
          break;
        case 'month':
          // For month view, we already handle this elsewhere
          return allEvents;
        case 'agenda':
          // For agenda view, use a wider range
          rangeStart = new Date(date);
          rangeStart.setDate(rangeStart.getDate() - 14); // Two weeks back
          rangeEnd = new Date(date);
          rangeEnd.setDate(rangeEnd.getDate() + 30); // One month forward
          break;
        default:
          return allEvents;
      }
      
      // Generate instances for each recurring event
      recurringEvents.forEach(event => {
        if (event.recurrencePattern) {
          const instances = generateRecurringEventInstances(event, rangeStart, rangeEnd);
          allEvents = [...allEvents, ...instances];
        }
      });
    }
    
    return allEvents;
  }, [events, date, view]);

  return (
    <div className="h-full overflow-hidden">
      {view === 'day' && (
        <DayView
          currentDate={date}
          events={processedEvents}
          onEventClick={onEventClick}
          onTimeSlotClick={onDayClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={date}
          events={processedEvents}
          onEventClick={onEventClick}
          onTimeSlotClick={onDayClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={date}
          events={processedEvents}
          onSelectDate={onDayClick}
          onEventClick={onEventClick}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          currentDate={date}
          events={processedEvents}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
