
import { Event } from './calendarTypes';

// Convert database event to app event
export const convertDbEventToEvent = (dbEvent: any): Event => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    description: dbEvent.description,
    location: dbEvent.location,
    type: dbEvent.type,
    calendar: dbEvent.calendar_id,
    isAllDay: false, // Default
  };
};

// Convert app event to database event
export const convertEventToDbEvent = (event: Event): any => {
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    location: event.location || '',
    type: event.type || 'client-meeting',
    calendar_id: event.calendar,
    updated_at: new Date().toISOString()
  };
};
