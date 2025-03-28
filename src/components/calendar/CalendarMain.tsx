
import React, { useMemo } from 'react';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarViewType } from '@/types/calendar';
import { CalendarEvent } from '@/types/calendar';
import { addDays, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { generateRecurringEvents } from '@/utils/recurrenceUtils';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarMain({ view, date, events, onEventClick, onDayClick }: CalendarMainProps) {
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
        viewStart = startOfWeek(date);
        viewEnd = endOfWeek(date);
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
  
  // Generate recurring events within the view's date range
  const eventsWithRecurrences = useMemo(() => {
    // Separate recurring parent events
    const recurringParentEvents = events.filter(
      event => event.isRecurring && event.recurrencePattern && !event.isRecurringInstance
    );
    
    // Non-recurring events and recurring instances
    const regularEvents = events.filter(
      event => !event.isRecurring || !event.recurrencePattern || event.isRecurringInstance
    );
    
    console.log(`Processing ${recurringParentEvents.length} recurring parent events`);
    
    // Generate recurring instances for each parent event
    let generatedRecurrences: CalendarEvent[] = [];
    
    recurringParentEvents.forEach(parentEvent => {
      const recurrences = generateRecurringEvents(
        parentEvent,
        viewDates.viewStart,
        viewDates.viewEnd
      );
      
      generatedRecurrences = [...generatedRecurrences, ...recurrences];
    });
    
    console.log(`Generated ${generatedRecurrences.length} recurring instances`);
    
    // Combine regular events with generated recurrences
    return [...regularEvents, ...generatedRecurrences];
  }, [events, viewDates]);

  return (
    <div className="h-full overflow-hidden">
      {view === 'day' && (
        <DayView
          currentDate={date}
          events={eventsWithRecurrences}
          onEventClick={onEventClick}
          onTimeSlotClick={onDayClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={date}
          events={eventsWithRecurrences}
          onEventClick={onEventClick}
          onTimeSlotClick={onDayClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={date}
          events={eventsWithRecurrences}
          onSelectDate={onDayClick}
          onEventClick={onEventClick}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          currentDate={date}
          events={eventsWithRecurrences}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
