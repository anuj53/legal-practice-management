
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Event, convertDbEventToEvent, convertEventToDbEvent, isValidUUID } from '@/utils/calendarUtils';

// Fetch calendars from Supabase
export const fetchCalendars = async () => {
  try {
    const { data: calendarsData, error: calendarsError } = await supabase
      .from('calendars')
      .select('*');

    if (calendarsError) {
      console.error('Error fetching calendars from DB:', calendarsError);
      throw calendarsError;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    if (calendarsData && calendarsData.length > 0) {
      console.log('Found calendars in DB:', calendarsData.length);
      
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
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        type,
        calendar_id,
        user_id,
        is_recurring,
        recurrence_pattern,
        recurrence_id,
        created_at,
        updated_at
      `);

    if (eventsError) {
      console.error('Error fetching events from DB:', eventsError);
      throw eventsError;
    }

    if (eventsData && eventsData.length > 0) {
      console.log('Found events in DB:', eventsData.length);
      console.log('Sample event from DB:', eventsData[0]);
      
      const convertedEvents = eventsData.map(event => {
        return convertDbEventToEvent(event);
      });
      
      console.log('Converted events:', convertedEvents.length);
      if (convertedEvents.length > 0) {
        console.log('Sample converted event:', convertedEvents[0]);
      }
      
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
    
    return {
      ...calendar,
      id: data[0].id,
    } as Calendar;
  } catch (err) {
    console.error('Error creating calendar:', err);
    throw err;
  }
};

// Delete calendar from Supabase
export const deleteCalendarFromDb = async (id: string) => {
  try {
    console.log('API: Deleting calendar from DB:', id);
    
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format for calendar ID: ${id}`);
    }
    
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .eq('calendar_id', id);
      
    if (eventsError) {
      console.error('Error deleting events for calendar from DB:', eventsError);
      throw eventsError;
    }
    
    const { error } = await supabase
      .from('calendars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar from DB:', error);
      throw error;
    }
    
    console.log('API: Calendar and associated events deleted from DB');
    return true;
  } catch (err) {
    console.error('Error deleting calendar:', err);
    throw err;
  }
};

// Create event in Supabase
export const createEventInDb = async (event: Omit<Event, 'id'>) => {
  try {
    console.log('API: Creating event in DB:', event);
    console.log('API: Calendar ID:', event.calendar);
    console.log('API: Calendar ID type:', typeof event.calendar);
    console.log('API: Calendar ID is valid UUID:', isValidUUID(event.calendar));
    
    if (!event.calendar) {
      const errorMsg = 'Calendar ID is missing or empty';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!isValidUUID(event.calendar)) {
      const errorMsg = `Invalid calendar ID format: "${event.calendar}"`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!event.title) {
      const errorMsg = 'Event title is required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!event.start || !event.end) {
      const errorMsg = 'Event start and end times are required';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const dbEvent = {
      title: event.title,
      description: event.description || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || '',
      type: event.type || 'client-meeting',
      calendar_id: event.calendar,
      updated_at: new Date().toISOString()
    };
    
    console.log('API: Formatted DB event for create:', dbEvent);
    console.log('API: Calendar ID being used:', dbEvent.calendar_id);
    console.log('API: Calendar ID is valid UUID:', isValidUUID(dbEvent.calendar_id));
    
    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select();

    if (error) {
      console.error('Error creating event in DB:', error);
      throw error;
    }
    
    console.log('API: Event created in DB, response:', data);
    
    if (!data || data.length === 0) {
      console.error('No data returned from event creation');
      throw new Error('No data returned from event creation');
    }
    
    const newEvent = convertDbEventToEvent(data[0]);
    console.log('API: Converted new event:', newEvent);
    return newEvent;
  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
};

// Update event in Supabase
export const updateEventInDb = async (event: Event) => {
  try {
    console.log('API: Updating event in DB:', event);
    console.log('API: Event ID:', event.id);
    console.log('API: Calendar ID:', event.calendar);
    
    if (!event.id) {
      throw new Error('Event ID cannot be empty for update operation');
    }
    
    if (typeof event.id !== 'string') {
      throw new Error(`Invalid event ID type: ${typeof event.id}, expected string`);
    }
    
    if (!isValidUUID(event.id)) {
      throw new Error(`Invalid UUID format for event ID: ${event.id}`);
    }
    
    if (!event.calendar) {
      throw new Error('Calendar ID cannot be empty');
    }
    
    if (!isValidUUID(event.calendar)) {
      throw new Error(`Invalid UUID format for calendar ID: ${event.calendar}`);
    }
    
    const dbEvent = {
      title: event.title,
      description: event.description || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || '',
      type: event.type || 'client-meeting',
      calendar_id: event.calendar,
      updated_at: new Date().toISOString()
    };
    
    console.log('API: Formatted DB event for update:', dbEvent);
    
    const { data, error } = await supabase
      .from('events')
      .update(dbEvent)
      .eq('id', event.id)
      .select();

    if (error) {
      console.error('Error updating event in DB:', error);
      throw error;
    }
    
    console.log('API: Event update response from DB:', data);
    
    if (!data || data.length === 0) {
      console.warn('Update succeeded but no data returned from database. Returning original event.');
      return event;
    }
    
    return convertDbEventToEvent(data[0]);
  } catch (err) {
    console.error('Error updating event:', err);
    throw err;
  }
};

// Delete event from Supabase
export const deleteEventFromDb = async (id: string) => {
  try {
    console.log('API: Deleting event from DB:', id);
    
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format for event ID: ${id}`);
    }
    
    // Check if this is a recurring parent event by looking for records with recurrencePattern
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
      
    if (eventError) {
      console.error('Error fetching event before deletion:', eventError);
      throw eventError;
    }
    
    // Execute the deletion
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event from DB:', error);
      throw error;
    }
    
    console.log('API: Event deleted from DB');
    return true;
  } catch (err) {
    console.error('Error deleting event:', err);
    throw err;
  }
};
