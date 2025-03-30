
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Event, isValidUUID, convertDbEventToEvent, convertEventToDbEvent } from '@/utils/calendarUtils';

// Fetch calendars from Supabase
export const fetchCalendars = async () => {
  try {
    console.log('Fetching calendars from database...');
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated, returning empty calendars');
      return { myCalendars: [], otherCalendars: [] };
    }

    console.log('User authenticated, user ID:', user.id);

    // Fetch calendars from database
    const { data: calendarsData, error: calendarsError } = await supabase
      .from('calendars')
      .select('*');

    if (calendarsError) {
      console.error('Error fetching calendars from DB:', calendarsError);
      throw calendarsError;
    }

    console.log('Raw calendar data from DB:', calendarsData);

    // Get current user
    const currentUserId = user?.id;
    
    if (calendarsData && calendarsData.length > 0) {
      console.log('Found calendars in DB:', calendarsData.length);
      console.log('Calendar data:', calendarsData);
      
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
          sharedWith: [], // Initialize with empty array
        }));
      
      const otherCalendars = calendarsData
        .filter(cal => cal.user_id !== currentUserId && (cal.is_public || cal.is_firm))
        .map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          checked: false,
          is_firm: cal.is_firm || false,
          is_statute: cal.is_statute || false,
          is_public: cal.is_public || false,
          sharedWith: [], // Initialize with empty array
        }));

      console.log('Processed myCalendars:', myCalendars);
      console.log('Processed otherCalendars:', otherCalendars);
      return { myCalendars, otherCalendars };
    }
    
    // If no calendars found, return empty arrays
    console.log('No calendars found in database, returning empty arrays');
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
        created_by,
        recurrence_pattern,
        case_id,
        client_name,
        assigned_lawyer,
        court_name,
        judge_details,
        docket_number
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
      
      // Create a reverse map from name to id for lookups later
      const eventTypeNameToId = eventTypes ? eventTypes.reduce((acc, type) => {
        acc[type.name.toLowerCase()] = type.id;
        return acc;
      }, {}) : {};
      
      // Fetch calendars for colors
      const { data: calendarsData } = await supabase
        .from('calendars')
        .select('*');
      
      const calendars = calendarsData ? calendarsData.map(cal => ({
        id: cal.id,
        name: cal.name,
        color: cal.color,
        checked: true,
        is_firm: cal.is_firm || false,
        is_statute: cal.is_statute || false,
        is_public: cal.is_public || false,
        sharedWith: []
      })) : [];
      
      // Convert database events to app events
      const convertedEvents = await Promise.all(eventsData.map(async (dbEvent) => {
        // Get attendees for the event
        const { data: attendeesData } = await supabase
          .from('event_attendees')
          .select('name, email')
          .eq('event_id', dbEvent.id);
        
        const attendees = attendeesData ? attendeesData.map(att => att.email || att.name).filter(Boolean) : [];
        
        // Get reminders for the event
        const { data: remindersData } = await supabase
          .from('event_reminders')
          .select('reminder_type, reminder_time')
          .eq('event_id', dbEvent.id)
          .order('reminder_time', { ascending: true })
          .limit(1);
        
        // Convert reminder to string format used in the UI
        let reminder = 'none';
        if (remindersData && remindersData.length > 0) {
          const reminderTime = remindersData[0].reminder_time;
          if (reminderTime === 5) reminder = '5min';
          else if (reminderTime === 15) reminder = '15min';
          else if (reminderTime === 30) reminder = '30min';
          else if (reminderTime === 60) reminder = '1hour';
          else if (reminderTime === 1440) reminder = '1day';
        }

        // Get documents for the event
        const { data: documentsData } = await supabase
          .from('event_documents')
          .select('id, name, url')
          .eq('event_id', dbEvent.id);
        
        const documents = documentsData || [];
        
        // Convert the base event
        const event = convertDbEventToEvent(dbEvent, eventTypeMap, calendars);
        
        // Add attendees, reminder and documents
        return {
          ...event,
          attendees,
          reminder,
          documents
        };
      }));
      
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
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Remove sharedWith from the data sent to Supabase if it exists
    const { sharedWith, ...calendarData } = calendar;
    
    const { data, error } = await supabase
      .from('calendars')
      .update({
        name: calendarData.name,
        color: calendarData.color,
        is_firm: calendarData.is_firm || false,
        is_statute: calendarData.is_statute || false,
        is_public: calendarData.is_public || false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', calendarData.id)
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
    
    console.log('Creating calendar with user ID:', user.id);
    console.log('Calendar data to be created:', calendar);
    
    // Remove sharedWith from the data sent to Supabase if it exists
    const { sharedWith, ...calendarData } = calendar as any;
    
    const { data, error } = await supabase
      .from('calendars')
      .insert({
        name: calendarData.name,
        color: calendarData.color,
        user_id: user.id,
        is_firm: calendarData.is_firm || false,
        is_statute: calendarData.is_statute || false,
        is_public: calendarData.is_public || false
      })
      .select();

    if (error) {
      console.error('Error creating calendar in DB:', error);
      throw error;
    }
    
    console.log('Calendar created in DB, response data:', data);
    
    // Return new calendar with generated ID and sharedWith array
    return {
      ...calendarData,
      id: data[0].id,
      sharedWith: sharedWith || []
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
      console.log(`Looking for event type: "${event.type}"`);
      // First try to find by exact name
      const { data: eventTypesByName } = await supabase
        .from('event_types')
        .select('*')
        .ilike('name', event.type)
        .limit(1);
      
      if (eventTypesByName && eventTypesByName.length > 0) {
        eventTypeId = eventTypesByName[0].id;
        console.log(`Found event type by name: ${event.type}, id: ${eventTypeId}`);
      } else {
        // If not found, create the event type
        const { data: newEventType, error: eventTypeError } = await supabase
          .from('event_types')
          .insert({
            name: event.type,
            color: event.color || '#4caf50' // Use the event color or default to green
          })
          .select();
        
        if (eventTypeError) {
          console.error('Error creating event type:', eventTypeError);
        } else if (newEventType && newEventType.length > 0) {
          eventTypeId = newEventType[0].id;
          console.log(`Created new event type: ${event.type}, id: ${eventTypeId}`);
        }
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
      recurrence_pattern: event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null,
      event_type_id: eventTypeId,
      calendar_id: event.calendar,
      created_by: user.id, // Set explicitly even though trigger will handle this
      case_id: event.caseId || null,
      client_name: event.clientName || null,
      assigned_lawyer: event.assignedLawyer || null,
      court_name: event.courtInfo?.courtName || null,
      judge_details: event.courtInfo?.judgeDetails || null,
      docket_number: event.courtInfo?.docketNumber || null
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
    
    // Save attendees if provided
    if (event.attendees && event.attendees.length > 0) {
      const attendeesToInsert = event.attendees.map(attendee => {
        const isEmail = attendee.includes('@');
        return {
          event_id: data[0].id,
          name: isEmail ? null : attendee,
          email: isEmail ? attendee : null
        };
      });
      
      const { error: attendeesError } = await supabase
        .from('event_attendees')
        .insert(attendeesToInsert);
      
      if (attendeesError) {
        console.error('Error saving event attendees:', attendeesError);
        // Don't throw here, we want to continue even if attendees fail
      }
    }
    
    // Save reminder if provided
    if (event.reminder && event.reminder !== 'none') {
      let reminderTime = 15; // default
      
      if (event.reminder === '5min') reminderTime = 5;
      else if (event.reminder === '15min') reminderTime = 15;
      else if (event.reminder === '30min') reminderTime = 30;
      else if (event.reminder === '1hour') reminderTime = 60;
      else if (event.reminder === '1day') reminderTime = 1440;
      
      const { error: reminderError } = await supabase
        .from('event_reminders')
        .insert({
          event_id: data[0].id,
          reminder_type: 'email', // default to email for now
          reminder_time: reminderTime
        });
      
      if (reminderError) {
        console.error('Error saving event reminder:', reminderError);
        // Don't throw here, we want to continue even if reminder fails
      }
    }
    
    // Save documents if provided
    if (event.documents && event.documents.length > 0) {
      const documentsToInsert = event.documents.map(doc => ({
        event_id: data[0].id,
        name: doc.name,
        url: doc.url
      }));
      
      const { error: documentsError } = await supabase
        .from('event_documents')
        .insert(documentsToInsert);
      
      if (documentsError) {
        console.error('Error saving event documents:', documentsError);
        // Don't throw here, we want to continue even if documents fail
      }
    }
    
    // Return new event with generated ID
    const newEvent = convertDbEventToEvent(data[0]);
    
    // Add the attendees, reminder and documents to returned event
    newEvent.attendees = event.attendees || [];
    newEvent.reminder = event.reminder || 'none';
    newEvent.documents = event.documents || [];
    
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
    
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
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
    
    // Get event type id - prefer the existing event_type_id if it exists
    let eventTypeId = event.event_type_id || null;
    
    // Only try to find/create event type if we don't already have one AND type isn't 'default'
    if (!eventTypeId && event.type && event.type.toLowerCase() !== 'default') {
      console.log(`Looking for event type to update: "${event.type}"`);
      
      // Try to find by exact name
      const { data: eventTypesByName, error: lookupError } = await supabase
        .from('event_types')
        .select('*')
        .ilike('name', event.type)
        .limit(1);
      
      if (lookupError) {
        console.error('Error looking up event type:', lookupError);
      }
      
      if (eventTypesByName && eventTypesByName.length > 0) {
        eventTypeId = eventTypesByName[0].id;
        console.log(`Found event type by name for update: ${event.type}, id: ${eventTypeId}`);
      } else {
        // If not found, create the event type
        console.log(`Event type "${event.type}" not found, creating new type with color: ${event.color || '#4caf50'}`);
        
        const { data: newEventType, error: eventTypeError } = await supabase
          .from('event_types')
          .insert({
            name: event.type,
            color: event.color || '#4caf50' // Use the event color or default to green
          })
          .select();
        
        if (eventTypeError) {
          console.error('Error creating event type during update:', eventTypeError);
        } else if (newEventType && newEventType.length > 0) {
          eventTypeId = newEventType[0].id;
          console.log(`Created new event type during update: ${event.type}, id: ${eventTypeId}`);
        }
      }
    } else if (event.type && event.type.toLowerCase() === 'default') {
      console.log('Using default event type (null)');
      eventTypeId = null;
    } else if (eventTypeId) {
      console.log(`Using existing event_type_id from event: ${eventTypeId}`);
    }
    
    console.log(`Final event_type_id for update: ${eventTypeId}`);
    
    // Create database event object for update
    const dbEvent = {
      title: event.title,
      description: event.description || null,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      location: event.location || null,
      is_recurring: event.isRecurring || false,
      recurrence_pattern: event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null,
      event_type_id: eventTypeId,
      calendar_id: event.calendar,
      updated_at: new Date().toISOString(),
      case_id: event.caseId || null,
      client_name: event.clientName || null,
      assigned_lawyer: event.assignedLawyer || null,
      court_name: event.courtInfo?.courtName || null,
      judge_details: event.courtInfo?.judgeDetails || null,
      docket_number: event.courtInfo?.docketNumber || null
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
    
    // Update attendees (remove all existing and add new ones)
    if (event.attendees) {
      // Delete existing attendees
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', event.id);
      
      // Add new attendees if any provided
      if (event.attendees.length > 0) {
        const attendeesToInsert = event.attendees.map(attendee => {
          const isEmail = attendee.includes('@');
          return {
            event_id: event.id,
            name: isEmail ? null : attendee,
            email: isEmail ? attendee : null
          };
        });
        
        const { error: attendeesError } = await supabase
          .from('event_attendees')
          .insert(attendeesToInsert);
        
        if (attendeesError) {
          console.error('Error updating event attendees:', attendeesError);
          // Don't throw here, we want to continue even if attendees fail
        }
      }
    }
    
    // Update reminder (remove existing and add new one if provided)
    await supabase
      .from('event_reminders')
      .delete()
      .eq('event_id', event.id);
    
    if (event.reminder && event.reminder !== 'none') {
      let reminderTime = 15; // default
      
      if (event.reminder === '5min') reminderTime = 5;
      else if (event.reminder === '15min') reminderTime = 15;
      else if (event.reminder === '30min') reminderTime = 30;
      else if (event.reminder === '1hour') reminderTime = 60;
      else if (event.reminder === '1day') reminderTime = 1440;
      
      const { error: reminderError } = await supabase
        .from('event_reminders')
        .insert({
          event_id: event.id,
          reminder_type: 'email', // default to email for now
          reminder_time: reminderTime
        });
      
      if (reminderError) {
        console.error('Error updating event reminder:', reminderError);
        // Don't throw here, we want to continue even if reminder fails
      }
    }
    
    // Update documents (remove all existing and add new ones)
    await supabase
      .from('event_documents')
      .delete()
      .eq('event_id', event.id);
    
    if (event.documents && event.documents.length > 0) {
      const documentsToInsert = event.documents.map(doc => ({
        event_id: event.id,
        name: doc.name,
        url: doc.url
      }));
      
      const { error: documentsError } = await supabase
        .from('event_documents')
        .insert(documentsToInsert);
      
      if (documentsError) {
        console.error('Error updating event documents:', documentsError);
        // Don't throw here, we want to continue even if documents fail
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('Update succeeded but no data returned from database. Returning original event.');
      return event;
    }
    
    // Return the updated event
    const updatedEvent = convertDbEventToEvent(data[0]);
    
    // Add the attendees, reminder and documents to returned event
    updatedEvent.attendees = event.attendees || [];
    updatedEvent.reminder = event.reminder || 'none';
    updatedEvent.documents = event.documents || [];
    // Preserve the event_type_id for future updates
    updatedEvent.event_type_id = eventTypeId;
    
    console.log('Event updated:', updatedEvent);
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
    
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Validate UUID before attempting to delete
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format for event ID: ${id}`);
    }
    
    // Delete attendees and reminders first (not strictly necessary due to cascade,
    // but being explicit for clarity)
    await supabase.from('event_attendees').delete().eq('event_id', id);
    await supabase.from('event_reminders').delete().eq('event_id', id);
    
    // Now delete the event
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
    
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
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
