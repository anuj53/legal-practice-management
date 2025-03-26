
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Event, convertDbEventToEvent, convertEventToDbEvent } from '@/utils/calendarUtils';

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Fetch calendars from Supabase
export const fetchCalendars = async () => {
  try {
    // Fetch calendars from database
    const { data: calendarsData, error: calendarsError } = await supabase
      .from('calendars')
      .select('*');

    if (calendarsError) {
      console.error('Error fetching calendars from DB:', calendarsError);
      throw calendarsError;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    if (calendarsData && calendarsData.length > 0) {
      console.log('Found calendars in DB:', calendarsData.length);
      
      // Transform to expected format and separate into my/other calendars
      const myCalendars = calendarsData
        .filter(cal => cal.user_id === null || cal.user_id === currentUserId)
        .map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          checked: true,
          is_firm: cal.is_firm,
          is_statute: cal.is_statute,
          is_public: cal.is_public,
        }));
      
      const otherCalendars = calendarsData
        .filter(cal => cal.user_id !== null && cal.user_id !== currentUserId && cal.is_public)
        .map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          checked: false,
          is_firm: cal.is_firm,
          is_statute: cal.is_statute,
          is_public: cal.is_public,
        }));

      return { myCalendars, otherCalendars };
    }
    return null;
  } catch (err) {
    console.error('Error fetching calendars:', err);
    throw err;
  }
};

// Fetch events from Supabase
export const fetchEvents = async () => {
  try {
    console.log('Fetching events from database...');
    // Fetch events from database
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        is_recurring,
        type,
        calendar_id
      `);

    if (eventsError) {
      console.error('Error fetching events from DB:', eventsError);
      throw eventsError;
    }

    if (eventsData && eventsData.length > 0) {
      console.log('Found events in DB:', eventsData.length);
      console.log('Sample event from DB:', eventsData[0]);
      
      const convertedEvents = eventsData.map(convertDbEventToEvent);
      console.log('Converted events:', convertedEvents.length);
      console.log('Sample converted event:', convertedEvents[0]);
      
      return convertedEvents;
    }
    console.log('No events found in database');
    return [];
  } catch (err) {
    console.error('Error fetching events:', err);
    throw err;
  }
};

// Update calendar in Supabase
export const updateCalendarInDb = async (calendar: Calendar) => {
  try {
    const { data, error } = await supabase
      .from('calendars')
      .update({
        name: calendar.name,
        color: calendar.color,
        is_firm: calendar.is_firm || false,
        is_statute: calendar.is_statute || false,
        is_public: calendar.is_public || false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', calendar.id)
      .select();

    if (error) {
      console.error('Error updating calendar in DB:', error);
      throw error;
    }
    
    console.log('Calendar updated in DB:', data);
    return data;
  } catch (err) {
    console.error('Error updating calendar:', err);
    throw err;
  }
};

// Create calendar in Supabase
export const createCalendarInDb = async (calendar: Omit<Calendar, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('calendars')
      .insert({
        name: calendar.name,
        color: calendar.color,
        is_firm: calendar.is_firm || false,
        is_statute: calendar.is_statute || false,
        is_public: calendar.is_public || false
      })
      .select();

    if (error) {
      console.error('Error creating calendar in DB:', error);
      throw error;
    }
    
    // Return new calendar with generated ID
    return {
      ...calendar,
      id: data[0].id,
    } as Calendar;
  } catch (err) {
    console.error('Error creating calendar:', err);
    throw err;
  }
};

// Create event in Supabase
export const createEventInDb = async (event: Omit<Event, 'id'>) => {
  try {
    console.log('Creating event in DB:', event);
    
    // Validate calendar ID
    if (!isValidUUID(event.calendar)) {
      throw new Error(`Invalid calendar ID format: ${event.calendar}`);
    }
    
    // Convert to database format
    // Create the DB event object with required fields for insert
    const dbEvent = {
      title: event.title,
      description: event.description,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location,
      is_recurring: event.isRecurring || false,
      type: event.type,
      calendar_id: event.calendar,
      updated_at: new Date().toISOString()
    };
    
    console.log('Formatted DB event for create:', dbEvent);
    
    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select();

    if (error) {
      console.error('Error creating event in DB:', error);
      throw error;
    }
    
    console.log('Event created in DB, response:', data);
    
    if (!data || data.length === 0) {
      console.error('No data returned from event creation');
      throw new Error('No data returned from event creation');
    }
    
    // Return new event with generated ID
    const newEvent = convertDbEventToEvent(data[0]);
    console.log('Converted new event:', newEvent);
    return newEvent;
  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
};

// Update event in Supabase
export const updateEventInDb = async (event: Event) => {
  try {
    console.log('Updating event in DB:', event);
    
    // Thorough UUID validation
    if (!event.id) {
      throw new Error('Event ID cannot be empty for update operation');
    }
    
    if (typeof event.id !== 'string') {
      throw new Error(`Invalid event ID type: ${typeof event.id}, expected string`);
    }
    
    if (!isValidUUID(event.id)) {
      throw new Error(`Invalid UUID format for event ID: ${event.id}`);
    }
    
    // Calendar ID validation
    if (!isValidUUID(event.calendar)) {
      throw new Error(`Invalid UUID format for calendar ID: ${event.calendar}`);
    }
    
    // Add detailed logging to debug the issue
    console.log('Event details for debugging:');
    console.log('  ID:', event.id);
    console.log('  Title:', event.title);
    console.log('  Start:', event.start);
    console.log('  End:', event.end);
    console.log('  Calendar:', event.calendar);
    
    // Convert to database format
    const dbEvent = convertEventToDbEvent(event);
    
    console.log('Formatted DB event for update:', dbEvent);
    
    const { data, error } = await supabase
      .from('events')
      .update(dbEvent)
      .eq('id', event.id)
      .select();

    if (error) {
      console.error('Error updating event in DB:', error);
      throw error;
    }
    
    console.log('Event update response from DB:', data);
    
    if (!data || data.length === 0) {
      console.warn('Update succeeded but no data returned from database. This might indicate the row wasn\'t found.');
    }
    
    return event;
  } catch (err) {
    console.error('Error updating event:', err);
    throw err;
  }
};

// Delete event from Supabase
export const deleteEventFromDb = async (id: string) => {
  try {
    console.log('Deleting event from DB:', id);
    
    // Validate UUID before attempting to delete
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format for event ID: ${id}`);
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event from DB:', error);
      throw error;
    }
    
    console.log('Event deleted from DB');
    return true;
  } catch (err) {
    console.error('Error deleting event:', err);
    throw err;
  }
};
