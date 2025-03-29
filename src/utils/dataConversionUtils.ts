
import { Event, RecurrencePattern } from '@/types/calendar';

/**
 * Converts a database event object to our application Event type
 */
export const convertDbEventToEvent = (dbEvent: any): Event => {
  try {
    // Parse dates from ISO strings
    const start = new Date(dbEvent.start_time);
    const end = new Date(dbEvent.end_time);
    
    // Parse recurrence pattern if it exists
    let recurrencePattern: RecurrencePattern | undefined = undefined;
    if (dbEvent.is_recurring && dbEvent.recurrence_pattern) {
      try {
        if (typeof dbEvent.recurrence_pattern === 'string') {
          recurrencePattern = JSON.parse(dbEvent.recurrence_pattern);
        } else {
          recurrencePattern = dbEvent.recurrence_pattern;
        }
      } catch (e) {
        console.error('Error parsing recurrence pattern:', e);
      }
    }
    
    // Convert to our Event type
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      start,
      end,
      description: dbEvent.description || '',
      location: dbEvent.location || '',
      calendar: dbEvent.calendar_id,
      type: dbEvent.type || 'client-meeting',
      isAllDay: false, // Add logic for all-day events if needed
      isRecurring: dbEvent.is_recurring || false,
      recurrencePattern,
    };
  } catch (error) {
    console.error('Error converting DB event to Event:', error, dbEvent);
    throw error;
  }
};

/**
 * Converts our application Event type to a database event object
 */
export const convertEventToDbEvent = (event: Event): any => {
  try {
    // Convert RecurrencePattern to a plain JSON object if it exists
    let recurrencePatternValue = null;
    if (event.recurrencePattern) {
      try {
        recurrencePatternValue = JSON.parse(JSON.stringify(event.recurrencePattern));
      } catch (e) {
        console.error('Error converting recurrence pattern to JSON:', e);
      }
    }
    
    // Convert to DB format
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || '',
      calendar_id: event.calendar,
      type: event.type || 'client-meeting',
      is_recurring: event.isRecurring || false,
      recurrence_pattern: recurrencePatternValue,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error converting Event to DB event:', error, event);
    throw error;
  }
};

/**
 * Creates a recurrence rule string from a RecurrencePattern
 */
export const createRecurrenceRule = (pattern: RecurrencePattern): string => {
  try {
    let rule = `FREQ=${pattern.frequency.toUpperCase()};INTERVAL=${pattern.interval}`;
    
    // Add weekdays for weekly recurrence
    if (pattern.frequency === 'weekly' && pattern.weekDays && pattern.weekDays.length > 0) {
      rule += `;BYDAY=${pattern.weekDays.join(',')}`;
    }
    
    // Add monthdays for monthly recurrence
    if (pattern.frequency === 'monthly' && pattern.monthDays && pattern.monthDays.length > 0) {
      rule += `;BYMONTHDAY=${pattern.monthDays.join(',')}`;
    }
    
    // Add end rule
    if (pattern.endsOn) {
      rule += `;UNTIL=${pattern.endsOn.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    } else if (pattern.endsAfter) {
      rule += `;COUNT=${pattern.endsAfter}`;
    }
    
    return rule;
  } catch (error) {
    console.error('Error creating recurrence rule:', error, pattern);
    return '';
  }
};
