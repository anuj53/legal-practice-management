import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Event,
} from '@/types/calendar';
import { isValidUUID } from '@/utils/calendarUtils';
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

export const useCalendar = () => {
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if data has been updated to trigger a re-fetch
  const [dataUpdated, setDataUpdated] = useState(0);

  // Fetch calendars and events when component mounts or data is updated
  useEffect(() => {
    const loadCalendarData = async () => {
      setLoading(true);
      try {
        // First fetch calendars
        const calendarsResult = await fetchCalendars();
        if (calendarsResult) {
          setMyCalendars(calendarsResult.myCalendars);
          setOtherCalendars(calendarsResult.otherCalendars);
          
          console.log('Calendars loaded:', {
            myCalendars: calendarsResult.myCalendars.length,
            otherCalendars: calendarsResult.otherCalendars.length
          });
        } else {
          console.log('No calendars returned from API');
          // If we don't have any calendars, we might be in demo mode
          // Let's set some placeholder calendars
          setMyCalendars([{
            id: 'default-calendar',
            name: 'My Calendar',
            color: '#ff9800',
            checked: true
          }]);
          setOtherCalendars([]);
        }
        
        // Then fetch events
        const eventsResult = await fetchEvents();
        if (eventsResult) {
          console.log('Events loaded:', eventsResult.length);
          setEvents(eventsResult);
        } else {
          console.log('No events returned from API');
          setEvents([]);
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Failed to load calendar data');
        setLoading(false);
        toast.error('Failed to load calendar data. Using demo mode.');
        
        // Fall back to demo data
        const demoCalendars = [
          {
            id: 'demo-calendar-1',
            name: 'Demo Calendar',
            color: '#ff9800',
            checked: true
          }
        ];
        setMyCalendars(demoCalendars);
        setOtherCalendars([]);
        setEvents([]);
      }
    };
    
    loadCalendarData();
  }, [dataUpdated]);
  
  // Toggle calendar visibility
  const toggleCalendar = (id: string) => {
    // First check if it's in myCalendars
    const calendarInMy = myCalendars.find(cal => cal.id === id);
    
    if (calendarInMy) {
      setMyCalendars(prev => 
        prev.map(cal => 
          cal.id === id ? { ...cal, checked: !cal.checked } : cal
        )
      );
    } else {
      // Otherwise check in otherCalendars
      setOtherCalendars(prev => 
        prev.map(cal => 
          cal.id === id ? { ...cal, checked: !cal.checked } : cal
        )
      );
    }
  };

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
      return calendar;
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar');
      toast.error('Failed to update calendar');
      throw err;
    }
  };

  // Delete calendar
  const deleteCalendar = async (id: string) => {
    try {
      // Validate UUID
      if (!isValidUUID(id)) {
        const msg = `Invalid calendar ID format: ${id}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // First delete from the database
      await deleteCalendarFromDb(id);
      
      // Then update local state
      setMyCalendars(prev => prev.filter(cal => cal.id !== id));
      setOtherCalendars(prev => prev.filter(cal => cal.id !== id));
      
      // Also remove events associated with this calendar
      setEvents(prev => prev.filter(event => event.calendar !== id));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Calendar deleted successfully!');
    } catch (err) {
      console.error('Error deleting calendar:', err);
      setError('Failed to delete calendar');
      toast.error(`Failed to delete calendar: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
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
      toast.error('Failed to create calendar. Using client-side ID for demo.');
      
      // Fall back to client-side ID generation for demo mode
      const newCalendar = {
        ...calendar,
        id: `demo-${Math.random().toString(36).substring(2, 9)}`,
      } as Calendar;
      
      setMyCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
    }
  };

  // Create event
  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      console.log('useCalendar: Creating event with calendar ID:', event.calendar);
      
      // Check calendar ID validity
      if (!event.calendar) {
        const msg = `Invalid calendar ID: ${event.calendar}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // For demo IDs, we create locally
      if (!isValidUUID(event.calendar) && event.calendar.startsWith('demo-')) {
        console.log('Using demo mode for event creation');
        const newEvent: Event = {
          ...event,
          id: `demo-event-${Math.random().toString(36).substring(2, 9)}`
        };
        setEvents(prev => [...prev, newEvent]);
        toast.success('Event created successfully!');
        return newEvent;
      }
      
      console.log('useCalendar: Creating event:', event);
      
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
      
      // Create a demo event as fallback
      const newEvent: Event = {
        ...event,
        id: `demo-event-${Math.random().toString(36).substring(2, 9)}`
      };
      setEvents(prev => [...prev, newEvent]);
      toast.success('Created event in demo mode');
      return newEvent;
    }
  };

  // Update event
  const updateEvent = async (event: Event) => {
    try {
      console.log('useCalendar: Updating event with ID:', event.id);
      console.log('useCalendar: Event calendar ID:', event.calendar);
      
      // For demo IDs, we just update locally
      if (event.id.startsWith('demo-')) {
        console.log('Using demo mode for event update');
        setEvents(prev => prev.map(e => e.id === event.id ? event : e));
        toast.success('Event updated successfully in demo mode!');
        return event;
      }
      
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
      
      // Update locally anyway as fallback
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      console.log('useCalendar: Deleting event with ID:', id);
      
      // Find the event we're deleting
      const eventToDelete = events.find(e => e.id === id);
      
      if (!eventToDelete) {
        throw new Error(`Event with ID ${id} not found`);
      }
      
      // For demo IDs, we just delete locally
      if (id.startsWith('demo-')) {
        console.log('Using demo mode for event deletion');
        setEvents(prev => prev.filter(e => e.id !== id));
        toast.success('Event deleted successfully in demo mode!');
        return;
      }
      
      // Validate UUID before attempting to delete
      if (!isValidUUID(id)) {
        const msg = `Invalid UUID format for event ID: ${id}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // First delete from the database
      await deleteEventFromDb(id);
      
      // Remove the event from local state
      setEvents(prev => prev.filter(e => e.id !== id));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event deleted successfully!');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      toast.error(`Failed to delete event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Delete locally anyway as fallback
      setEvents(prev => prev.filter(e => e.id !== id));
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
    toggleCalendar,
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteCalendar,
  };
};
