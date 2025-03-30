
import { addHours, addDays, subDays, startOfDay, addMonths, addWeeks, addYears } from 'date-fns';
import { CalendarShare } from '@/types/calendar';

// Types
export interface Calendar {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  user_id?: string;
  is_firm?: boolean;
  is_statute?: boolean;
  is_public?: boolean;
  sharedWith?: CalendarShare[];
  isSelected?: boolean;
}

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    occurrences?: number;
    endDate?: Date;
  };
  type: string;
  calendar: string;
  description?: string;
  location?: string;
  color?: string;
}

// UUID validation function
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}

// Expand recurring events based on their recurrence pattern
export function expandRecurringEvents(events: Event[]): Event[] {
  if (!events.length) return [];
  
  let expandedEvents: Event[] = [];
  
  for (const event of events) {
    if (!event.isRecurring || !event.recurrencePattern) {
      expandedEvents.push(event);
      continue;
    }
    
    const { frequency, interval = 1, occurrences, endDate } = event.recurrencePattern;
    const occurrenceLimit = occurrences || 52; // Default to max 52 occurrences (1 year for weekly)
    
    // Create base occurrence (original event)
    expandedEvents.push(event);
    
    let currentDate = new Date(event.start);
    let count = 1; // We already added the original event
    
    // Generate occurrences based on pattern
    while (count < occurrenceLimit) {
      let nextDate: Date;
      
      // Calculate next occurrence date based on frequency
      if (frequency === 'DAILY') {
        nextDate = addDays(currentDate, interval);
      } else if (frequency === 'WEEKLY') {
        nextDate = addWeeks(currentDate, interval);
      } else if (frequency === 'MONTHLY') {
        nextDate = addMonths(currentDate, interval);
      } else if (frequency === 'YEARLY') {
        nextDate = addYears(currentDate, interval);
      } else {
        break; // Unknown frequency
      }
      
      // Check if we've reached the end date
      if (endDate && nextDate > new Date(endDate)) {
        break;
      }
      
      // Calculate event duration
      const duration = event.end.getTime() - event.start.getTime();
      
      // Create occurrence event
      const occurrenceEvent: Event = {
        ...event,
        id: `${event.id}_occurrence_${count}`,
        start: nextDate,
        end: new Date(nextDate.getTime() + duration)
      };
      
      expandedEvents.push(occurrenceEvent);
      
      currentDate = nextDate;
      count++;
    }
  }
  
  return expandedEvents;
}

// Convert database event format to app event format
export const convertDbEventToEvent = (dbEvent: any, eventTypeMap?: any): Event => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    isAllDay: dbEvent.is_all_day || false,
    isRecurring: dbEvent.is_recurring || false,
    recurrencePattern: dbEvent.recurrence_pattern,
    type: dbEvent.event_type_id || 'client-meeting',
    calendar: dbEvent.calendar_id,
    description: dbEvent.description || '',
    location: dbEvent.location || '',
    color: eventTypeMap && dbEvent.event_type_id ? eventTypeMap[dbEvent.event_type_id]?.color : undefined
  };
};

// Convert app event format to database event format
export const convertEventToDbEvent = (event: Event) => {
  return {
    id: event.id,
    title: event.title,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    is_all_day: event.isAllDay || false,
    is_recurring: event.isRecurring || false,
    recurrence_pattern: event.recurrencePattern,
    event_type_id: event.type,
    calendar_id: event.calendar,
    description: event.description || null,
    location: event.location || null,
  };
};
