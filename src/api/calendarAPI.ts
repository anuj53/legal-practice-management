
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Event, convertDbEventToEvent, convertEventToDbEvent, isValidUUID } from '@/utils/calendarUtils';

// Fetch calendars from Supabase
export const fetchCalendars = async () => {
  try {
    console.log('Fetching calendars from database...');
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
        .filter(cal => cal.user_id === currentUserId)
        .map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          checked: true,
          is_firm: cal.is_firm || false,
          is_statute: cal.is_statute || false,
          is_public: cal.is_public || false,
        }));
      
      const otherCalendars = calendarsData
        .filter(cal => cal.user_id !== currentUserId && cal.is_public)
        .map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          checked: false,
          is_firm: cal.is_firm || false,
          is_statute: cal.is_statute || false,
          is_public: cal.is_public || false,
        }));

      return { myCalendars, otherCalendars };
    }
    
    // If no calendars found, return empty arrays
    return { myCalendars: [], otherCalendars: [] };
  } catch (err) {
    console.error('Error fetching calendars:', err);
    throw err;
  }
};

// Fetch events from Supabase
export const fetchEvents = async () => {
  try {
    console.log('Fetching events from database...');
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated, returning empty events array');
      return [];
    }
    
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
        event_type_id,
        calendar_id,
        created_by
      `);

    if (eventsError) {
      console.error('Error fetching events from DB:', eventsError);
      throw eventsError;
    }

    if (eventsData && eventsData.length > 0) {
      console.log('Found events in DB:', eventsData.length);
      
      // Fetch event types to get colors
      const { data: eventTypes } = await supabase
        .from('event_types')
        .select('*');
      
      const eventTypeMap = eventTypes ? eventTypes.reduce((acc, type) => {
        acc[type.id] = { name: type.name, color: type.color };
        return acc;
      }, {}) : {};
      
      const convertedEvents = eventsData.map(dbEvent => {
        // Get event type information
        const eventTypeInfo = dbEvent.event_type_id ? eventTypeMap[dbEvent.event_type_id] : null;
        
        return {
          id: dbEvent.id,
          title: dbEvent.title,
          description: dbEvent.description || '',
          start: new Date(dbEvent.start_time),
          end: new Date(dbEvent.end_time),
          type: eventTypeInfo ? eventTypeInfo.name : 'client-meeting',
          color: eventTypeInfo ? eventTypeInfo.color : null,
          calendar: dbEvent.calendar_id,
          location: dbEvent.location || '',
          isRecurring: dbEvent.is_recurring || false,
          createdBy: dbEvent.created_by,
          isAllDay: false, // You might want to add this to your database
        };
      });
      
      console.log('Converted events:', convertedEvents.length);
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
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create a calendar');
    }
    
    const { data, error } = await supabase
      .from('calendars')
      .insert({
        name: calendar.name,
        color: calendar.color,
        user_id: user.id,
        is_firm: calendar.is_firm || false,
        is_statute: calendar.is_statute || false,
        is_public: calendar.is_public || false
      })
      .select();

    if (error) {
      console.error('Error creating calendar in DB:', error);
      throw error;
    }
    
    console.log('Calendar created in DB:', data);
    
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
    console.log('API: Creating event in DB:', event);
    
    // Comprehensive validation for create
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
    
    // Get current user ID for created_by field
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to create an event');
    }
    
    // Find event type id if needed
    let eventTypeId = null;
    if (event.type) {
      const { data: eventTypes } = await supabase
        .from('event_types')
        .select('*')
        .eq('name', event.type)
        .limit(1);
      
      if (eventTypes && eventTypes.length > 0) {
        eventTypeId = eventTypes[0].id;
      }
    }
    
    // Create database event object
    const dbEvent = {
      title: event.title,
      description: event.description || null,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || null,
      is_recurring: event.isRecurring || false,
      event_type_id: eventTypeId,
      calendar_id: event.calendar,
      created_by: user.id
    };
    
    console.log('API: Formatted DB event for create:', dbEvent);
    
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
    
    // Return new event with generated ID
    const newEvent = {
      id: data[0].id,
      title: data[0].title,
      description: data[0].description || '',
      start: new Date(data[0].start_time),
      end: new Date(data[0].end_time),
      type: event.type || 'client-meeting',
      calendar: data[0].calendar_id,
      location: data[0].location || '',
      isRecurring: data[0].is_recurring || false,
      createdBy: data[0].created_by,
      isAllDay: event.isAllDay || false
    };
    
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
    
    // Thorough UUID validation for update
    if (!event.id) {
      throw new Error('Event ID cannot be empty for update operation');
    }
    
    if (!isValidUUID(event.id)) {
      throw new Error(`Invalid UUID format for event ID: ${event.id}`);
    }
    
    // Calendar ID validation
    if (!event.calendar) {
      throw new Error('Calendar ID cannot be empty');
    }
    
    if (!isValidUUID(event.calendar)) {
      throw new Error(`Invalid UUID format for calendar ID: ${event.calendar}`);
    }
    
    // Get event type id
    let eventTypeId = null;
    if (event.type) {
      const { data: eventTypes } = await supabase
        .from('event_types')
        .select('*')
        .eq('name', event.type)
        .limit(1);
      
      if (eventTypes && eventTypes.length > 0) {
        eventTypeId = eventTypes[0].id;
      }
    }
    
    // Create database event object for update
    const dbEvent = {
      title: event.title,
      description: event.description || null,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || null,
      is_recurring: event.isRecurring || false,
      event_type_id: eventTypeId,
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
    
    // Return the updated event
    const updatedEvent = {
      id: data[0].id,
      title: data[0].title,
      description: data[0].description || '',
      start: new Date(data[0].start_time),
      end: new Date(data[0].end_time),
      type: event.type || 'client-meeting',
      calendar: data[0].calendar_id,
      location: data[0].location || '',
      isRecurring: data[0].is_recurring || false,
      createdBy: data[0].created_by,
      isAllDay: event.isAllDay || false
    };
    
    return updatedEvent;
  } catch (err) {
    console.error('Error updating event:', err);
    throw err;
  }
};

// Delete event from Supabase
export const deleteEventFromDb = async (id: string) => {
  try {
    console.log('API: Deleting event from DB:', id);
    
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
    
    console.log('API: Event deleted from DB');
    return true;
  } catch (err) {
    console.error('Error deleting event:', err);
    throw err;
  }
};

// Delete calendar from Supabase
export const deleteCalendarFromDb = async (id: string) => {
  try {
    console.log('API: Deleting calendar from DB:', id);
    
    // Validate UUID before attempting to delete
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format for calendar ID: ${id}`);
    }
    
    const { error } = await supabase
      .from('calendars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar from DB:', error);
      throw error;
    }
    
    console.log('API: Calendar deleted from DB');
    return true;
  } catch (err) {
    console.error('Error deleting calendar:', err);
    throw err;
  }
};
