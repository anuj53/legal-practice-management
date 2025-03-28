
import { Event } from './types';
import { isValidUUID } from './validation';

// Convert database event to local Event format
export const convertDbEventToEvent = (dbEvent: any): Event => {
  console.log('Converting DB event to app event:', dbEvent);
  
  if (!dbEvent || !dbEvent.calendar_id) {
    console.error('Invalid DB event:', dbEvent);
    throw new Error('Cannot convert invalid DB event: missing calendar_id');
  }
  
  const event = {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    type: dbEvent.type || 'client-meeting',
    calendar: dbEvent.calendar_id,
    location: dbEvent.location || '',
    isRecurring: dbEvent.is_recurring || false,
    attendees: [], // Assume empty for now as they're stored in a separate table
    isAllDay: false,
  };
  
  console.log('Converted event:', event);
  console.log('Calendar ID:', event.calendar, 'Valid:', isValidUUID(event.calendar));
  return event;
};

// Convert local Event to database format
export const convertEventToDbEvent = (eventObj: Event | Omit<Event, 'id'>) => {
  // Log the input for debugging
  console.log('Converting app event to DB event, input:', eventObj);
  
  // Validate calendar ID
  if (!eventObj.calendar) {
    console.error('Missing calendar ID in event:', eventObj);
    throw new Error('Missing calendar ID for database operation');
  }
  
  if (!isValidUUID(eventObj.calendar)) {
    console.error('Invalid calendar ID format in event:', eventObj);
    throw new Error(`Invalid calendar ID format: ${eventObj.calendar}`);
  }
  
  // Create a clean database event object with only the fields we need to store
  const dbEvent = {
    title: eventObj.title,
    description: eventObj.description,
    start_time: eventObj.start.toISOString(),
    end_time: eventObj.end.toISOString(),
    location: eventObj.location,
    is_recurring: eventObj.isRecurring || false,
    type: eventObj.type,
    calendar_id: eventObj.calendar,
    updated_at: new Date().toISOString(),
    // Only include ID if it exists in the event object (for updates)
    ...('id' in eventObj ? { id: eventObj.id } : {})
  };
  
  console.log('Converted to DB event:', dbEvent);
  console.log('Calendar ID being used:', dbEvent.calendar_id);
  return dbEvent;
};
