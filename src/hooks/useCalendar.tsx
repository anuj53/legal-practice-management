
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
  console.log('Using real database hook: useCalendar.tsx');
  
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState(null);
  
  const [dataUpdated, setDataUpdated] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          setSession(newSession);
          if (event === 'SIGNED_IN') {
            loadCalendarData();
          } else if (event === 'SIGNED_OUT') {
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
  
  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, skipping data load');
        setLoading(false);
        return;
      }
      
      const calendarsResult = await fetchCalendars();
      if (calendarsResult) {
        console.log('Loaded calendars from DB:', calendarsResult);
        
        // Get existing calendar checked state to preserve it
        const existingMyCalendars = myCalendars.reduce((acc, cal) => {
          acc[cal.id] = cal.checked;
          return acc;
        }, {} as Record<string, boolean>);
        
        const existingOtherCalendars = otherCalendars.reduce((acc, cal) => {
          acc[cal.id] = cal.checked;
          return acc;
        }, {} as Record<string, boolean>);
        
        // Apply existing checked state or default to true
        const processedMyCalendars = calendarsResult.myCalendars.map(cal => ({
          ...cal,
          checked: existingMyCalendars[cal.id] !== undefined ? existingMyCalendars[cal.id] : true
        }));
        
        const processedOtherCalendars = calendarsResult.otherCalendars.map(cal => ({
          ...cal,
          checked: existingOtherCalendars[cal.id] !== undefined ? existingOtherCalendars[cal.id] : true
        }));
        
        setMyCalendars(processedMyCalendars);
        setOtherCalendars(processedOtherCalendars);
        
        // Print calendars with colors for debugging
        console.log('Processed myCalendars with colors:', 
          processedMyCalendars.map(cal => ({id: cal.id, name: cal.name, color: cal.color, checked: cal.checked}))
        );
      } else {
        await createDefaultCalendars();
      }
      
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

  const createDefaultCalendars = async () => {
    try {
      const defaultCalendars = [
        {
          name: 'My Calendar',
          color: '#3B82F6',
          checked: true,
          is_firm: false,
          is_statute: false,
          is_public: false,
          sharedWith: []
        },
        {
          name: 'Firm Calendar',
          color: '#22C55E',
          checked: true,
          is_firm: true,
          is_statute: false,
          is_public: true,
          sharedWith: []
        },
        {
          name: 'Statute of Limitations',
          color: '#EF4444',
          checked: true,
          is_firm: false,
          is_statute: true,
          is_public: false,
          sharedWith: []
        }
      ];
      
      const createdCalendars: Calendar[] = [];
      for (const calendar of defaultCalendars) {
        const newCalendar = await createCalendarInDb(calendar);
        createdCalendars.push(newCalendar);
      }
      
      setMyCalendars(createdCalendars);
      
      toast.success('Default calendars created');
    } catch (err) {
      console.error('Error creating default calendars:', err);
      toast.error('Failed to create default calendars');
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [dataUpdated]);

  const updateCalendar = async (calendar: Calendar) => {
    try {
      // Check if this is just a visibility toggle (checked property)
      const isVisibilityToggle = 'checked' in calendar && 
        Object.keys(calendar).some(key => key === 'checked');
      
      // If it's a full update (not just a toggle), update in DB
      if (!isVisibilityToggle) {
        await updateCalendarInDb(calendar);
        
        // Update local state
        if (myCalendars.some(cal => cal.id === calendar.id)) {
          setMyCalendars(prev => 
            prev.map(cal => cal.id === calendar.id ? calendar : cal)
          );
        } else {
          setOtherCalendars(prev => 
            prev.map(cal => cal.id === calendar.id ? calendar : cal)
          );
        }
        
        // Trigger a full data reload only for non-visibility updates
        setDataUpdated(prev => prev + 1);
        toast.success(`Updated calendar: ${calendar.name}`);
      }
      // For visibility toggle, we don't need to hit the DB or trigger reload
      // The state is already updated in useCalendarPage
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar');
      toast.error('Failed to update calendar');
    }
  };

  const createCalendar = async (calendar: Omit<Calendar, 'id'>) => {
    try {
      const newCalendar = await createCalendarInDb(calendar);
      
      setMyCalendars(prev => [...prev, newCalendar]);
      
      setDataUpdated(prev => prev + 1);
      
      toast.success(`Created new calendar: ${newCalendar.name}`);
      return newCalendar;
    } catch (err) {
      console.error('Error creating calendar:', err);
      setError('Failed to create calendar');
      toast.error('Failed to create calendar');
      
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
        sharedWith: calendar.sharedWith || []
      } as Calendar;
      
      setMyCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
    }
  };

  const deleteCalendar = async (id: string) => {
    try {
      await deleteCalendarFromDb(id);
      
      setMyCalendars(prev => prev.filter(cal => cal.id !== id));
      setOtherCalendars(prev => prev.filter(cal => cal.id !== id));
      
      setEvents(prev => prev.filter(event => event.calendar !== id));
      
      setDataUpdated(prev => prev + 1);
      
      toast.success('Calendar deleted successfully');
    } catch (err) {
      console.error('Error deleting calendar:', err);
      setError('Failed to delete calendar');
      toast.error('Failed to delete calendar');
    }
  };

  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      console.log('useCalendar: Creating event with calendar ID:', event.calendar);
      console.log('useCalendar: Event type:', event.type);
      
      if (!event.calendar || !isValidUUID(event.calendar)) {
        const msg = `Invalid calendar ID: ${event.calendar}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      const newEvent = await createEventInDb(event);
      console.log('useCalendar: createEventInDb returned new event:', newEvent);
      
      setEvents(prev => [...prev, newEvent]);
      
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      toast.error(`Failed to create event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const updateEvent = async (event: Event) => {
    try {
      console.log('useCalendar: Updating event with ID:', event.id);
      console.log('useCalendar: Event calendar ID:', event.calendar);
      console.log('useCalendar: Event type:', event.type);
      
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
      
      const updatedEvent = await updateEventInDb(event);
      console.log('useCalendar: Updated event returned:', updatedEvent);
      
      setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
      
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event updated successfully!');
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error(`Failed to update event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      console.log('useCalendar: Deleting event with ID:', id);
      
      if (!isValidUUID(id)) {
        const msg = `Invalid event ID format: ${id}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      await deleteEventFromDb(id);
      
      setEvents(prev => prev.filter(e => e.id !== id));
      
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event deleted successfully!');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      toast.error(`Failed to delete event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
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
