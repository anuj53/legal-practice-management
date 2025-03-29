
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Event, isValidUUID } from '@/utils/calendarUtils';
import {
  fetchCalendars,
  fetchEvents,
  updateCalendarInDb,
  createCalendarInDb,
  createEventInDb,
  updateEventInDb,
  deleteEventFromDb,
  deleteCalendarFromDb
} from '@/api/calendarAPI';
import { supabase } from '@/integrations/supabase/client';

export const useCalendar = () => {
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  
  // Track if data has been updated to trigger a re-fetch
  const [dataUpdated, setDataUpdated] = useState(0);

  // Initialize auth state
  useEffect(() => {
    // Check for authentication
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Set up auth state change subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          setSession(newSession);
          // Force data refresh when auth state changes
          if (event === 'SIGNED_IN') {
            loadCalendarData();
          } else if (event === 'SIGNED_OUT') {
            // Clear data on sign out
            setMyCalendars([]);
            setOtherCalendars([]);
            setEvents([]);
          }
        }
      );
      
      return () => subscription.unsubscribe();
    };
    
    initAuth();
  }, []);
  
  // Load calendar data from the database
  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // First check if we have a user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, skipping data load');
        setLoading(false);
        return;
      }
      
      // Fetch calendars
      const calendarsResult = await fetchCalendars();
      if (calendarsResult) {
        setMyCalendars(calendarsResult.myCalendars);
        setOtherCalendars(calendarsResult.otherCalendars);
      } else {
        // If no calendars returned, create default calendars
        await createDefaultCalendars();
      }
      
      // Fetch events
      const eventsData = await fetchEvents();
      setEvents(eventsData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Failed to load calendar data');
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Create default calendars for new users
  const createDefaultCalendars = async () => {
    try {
      // Default calendars to create
      const defaultCalendars = [
        {
          name: 'My Calendar',
          color: '#3B82F6',
          checked: true,
          is_firm: false,
          is_statute: false,
          is_public: false
        },
        {
          name: 'Firm Calendar',
          color: '#22C55E',
          checked: true,
          is_firm: true,
          is_statute: false,
          is_public: true
        },
        {
          name: 'Statute of Limitations',
          color: '#EF4444',
          checked: true,
          is_firm: false,
          is_statute: true,
          is_public: false
        }
      ];
      
      // Create each default calendar
      const createdCalendars: Calendar[] = [];
      for (const calendar of defaultCalendars) {
        const newCalendar = await createCalendarInDb(calendar);
        createdCalendars.push(newCalendar);
      }
      
      // Set the new calendars
      setMyCalendars(createdCalendars);
      
      toast.success('Default calendars created');
    } catch (err) {
      console.error('Error creating default calendars:', err);
      toast.error('Failed to create default calendars');
    }
  };

  // Load data on initial mount and when dataUpdated changes
  useEffect(() => {
    loadCalendarData();
  }, [dataUpdated]);

  // Update calendar
  const updateCalendar = async (calendar: Calendar) => {
    try {
      // First update the database
      await updateCalendarInDb(calendar);
      
      // Then update local state
      if (myCalendars.some(cal => cal.id === calendar.id)) {
        setMyCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      } else {
        setOtherCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      }
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success(`Updated calendar: ${calendar.name}`);
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar');
      toast.error('Failed to update calendar');
    }
  };

  // Create calendar
  const createCalendar = async (calendar: Omit<Calendar, 'id'>) => {
    try {
      // First create in the database
      const newCalendar = await createCalendarInDb(calendar);
      
      // Update local state
      setMyCalendars(prev => [...prev, newCalendar]);
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success(`Created new calendar: ${newCalendar.name}`);
      return newCalendar;
    } catch (err) {
      console.error('Error creating calendar:', err);
      setError('Failed to create calendar');
      toast.error('Failed to create calendar');
      
      // Fall back to client-side ID generation as a last resort
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
      } as Calendar;
      
      setMyCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
    }
  };

  // Delete calendar
  const deleteCalendar = async (id: string) => {
    try {
      // First delete from the database
      await deleteCalendarFromDb(id);
      
      // Then update local state
      setMyCalendars(prev => prev.filter(cal => cal.id !== id));
      setOtherCalendars(prev => prev.filter(cal => cal.id !== id));
      
      // Also remove any events associated with this calendar
      setEvents(prev => prev.filter(event => event.calendar !== id));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Calendar deleted successfully');
    } catch (err) {
      console.error('Error deleting calendar:', err);
      setError('Failed to delete calendar');
      toast.error('Failed to delete calendar');
    }
  };

  // Create event
  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      console.log('useCalendar: Creating event with calendar ID:', event.calendar);
      
      // Check calendar ID validity
      if (!event.calendar || !isValidUUID(event.calendar)) {
        const msg = `Invalid calendar ID: ${event.calendar}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // First create in the database
      const newEvent = await createEventInDb(event);
      console.log('useCalendar: createEventInDb returned new event:', newEvent);
      
      // Update local state
      setEvents(prev => [...prev, newEvent]);
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      toast.error(`Failed to create event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err; // Re-throw so the caller can handle it
    }
  };

  // Update event
  const updateEvent = async (event: Event) => {
    try {
      console.log('useCalendar: Updating event with ID:', event.id);
      console.log('useCalendar: Event calendar ID:', event.calendar);
      
      // Validate IDs before proceeding
      if (!event.id || !isValidUUID(event.id)) {
        const msg = `Invalid event ID: ${event.id}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      if (!event.calendar || !isValidUUID(event.calendar)) {
        const msg = `Invalid calendar ID: ${event.calendar}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // First update in the database
      const updatedEvent = await updateEventInDb(event);
      
      // Update local state
      setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
      
      // Trigger a data refresh to ensure we get the latest data from DB
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event updated successfully!');
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error(`Failed to update event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err; // Re-throw so the caller can handle it
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      console.log('useCalendar: Deleting event with ID:', id);
      
      // Validate UUID before attempting to delete
      if (!isValidUUID(id)) {
        const msg = `Invalid event ID format: ${id}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // First delete from the database
      await deleteEventFromDb(id);
      
      // Update local state
      setEvents(prev => prev.filter(e => e.id !== id));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event deleted successfully!');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      toast.error(`Failed to delete event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err; // Re-throw so the caller can handle it
    }
  };

  return {
    myCalendars,
    otherCalendars,
    events,
    loading,
    error,
    dataUpdated,
    setMyCalendars,
    setOtherCalendars,
    setEvents,
    setLoading,
    setError,
    updateCalendar,
    createCalendar,
    deleteCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
