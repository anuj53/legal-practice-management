
import React, { useMemo } from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarViewType } from '@/types/calendar';
import { CalendarEvent } from '@/types/calendar';
import { startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { generateRecurringEventInstances } from '@/utils/calendarUtils';

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
    console.log(`Processing events for ${view} view with ${events.length} events`);
    
    // Separate recurring and non-recurring events
    const recurringEvents = events.filter(event => event.isRecurring && event.recurrencePattern);
    const regularEvents = events.filter(event => !event.isRecurring || !event.recurrencePattern);
    
    // Exclude existing recurring instances to avoid duplicates
    const filteredRegularEvents = regularEvents.filter(event => !event.isRecurringInstance);
    
    console.log(`Found ${recurringEvents.length} recurring events to process`);
    console.log(`Found ${filteredRegularEvents.length} regular events to display`);
    
    if (recurringEvents.length === 0) {
      return filteredRegularEvents;
    }
    
    // Determine the appropriate date range for recurring events based on view
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
        rangeStart = startOfMonth(date);
        rangeEnd = endOfMonth(date);
        break;
      case 'agenda':
        // For agenda view, use a wider range
        rangeStart = new Date(date);
        rangeStart.setDate(rangeStart.getDate() - 14); // Two weeks back
        rangeEnd = new Date(date);
        rangeEnd.setDate(rangeEnd.getDate() + 30); // One month forward
        break;
      default:
        return filteredRegularEvents;
    }
    
    console.log(`Date range for recurring events: ${rangeStart.toISOString()} to ${rangeEnd.toISOString()}`);
    
    // Generate instances for each recurring event
    let recurringInstances: CalendarEvent[] = [];
    
    recurringEvents.forEach(event => {
      if (event.recurrencePattern) {
        console.log(`Generating instances for event: ${event.title} with pattern:`, event.recurrencePattern);
        const instances = generateRecurringEventInstances(event, rangeStart, rangeEnd);
        console.log(`Generated ${instances.length} instances`);
        recurringInstances = [...recurringInstances, ...instances];
      }
    });
    
    // Combine regular events with recurring instances
    return [...filteredRegularEvents, ...recurringInstances];
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
