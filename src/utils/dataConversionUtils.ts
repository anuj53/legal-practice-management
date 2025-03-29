import { Event } from '@/types/calendar';

// Convert DB event object to UI Event object
export const convertDbEventToEvent = (dbEvent: any): Event => {
  // Console log for debugging
  console.log('Converting DB event to Event:', dbEvent);
  
  try {
    let recurrencePattern = null;
    if (dbEvent.recurrence_pattern) {
      try {
        // If it's a string, parse it
        if (typeof dbEvent.recurrence_pattern === 'string') {
          recurrencePattern = JSON.parse(dbEvent.recurrence_pattern);
        } else {
          // Otherwise assume it's already a JSON object
          recurrencePattern = dbEvent.recurrence_pattern;
        }
      } catch (e) {
        console.error('Error parsing recurrence pattern:', e);
      }
    }
    
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || '',
      start: new Date(dbEvent.start_time),
      end: new Date(dbEvent.end_time),
      location: dbEvent.location || '',
      type: dbEvent.type || 'client-meeting',
      calendar: dbEvent.calendar_id,
      isRecurring: dbEvent.is_recurring || false,
      recurrencePattern: recurrencePattern,
      recurrenceId: dbEvent.recurrence_id,
    };
  } catch (error) {
    console.error('Error converting DB event to Event:', error);
    throw error;
  }
};

// Convert UI Event object to DB event object
export const convertEventToDbEvent = (event: Event): any => {
  // Console log for debugging
  console.log('Converting Event to DB event:', event);
  
  try {
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || '',
      type: event.type || 'client-meeting',
      calendar_id: event.calendar,
      is_recurring: event.isRecurring || false,
      recurrence_pattern: event.recurrencePattern ? JSON.parse(JSON.stringify(event.recurrencePattern)) : null,
      recurrence_id: event.recurrenceId || null,
    };
  } catch (error) {
    console.error('Error converting Event to DB event:', error);
    throw error;
  }
};

// Create a recurrence rule string
export const createRecurrenceRule = (pattern: any): string => {
  if (!pattern || !pattern.frequency) {
    return '';
  }
  
  try {
    let rule = `FREQ=${pattern.frequency.toUpperCase()};INTERVAL=${pattern.interval || 1}`;
    
    if (pattern.weekDays && pattern.weekDays.length > 0) {
      rule += `;BYDAY=${pattern.weekDays.join(',')}`;
    }
    
    if (pattern.monthDays && pattern.monthDays.length > 0) {
      rule += `;BYMONTHDAY=${pattern.monthDays.join(',')}`;
    }
    
    if (pattern.endsOn) {
      rule += `;UNTIL=${pattern.endsOn}`;
    } else if (pattern.endsAfter) {
      rule += `;COUNT=${pattern.endsAfter}`;
    }
    
    return rule;
  } catch (error) {
    console.error('Error creating recurrence rule:', error);
    return '';
  }
};
