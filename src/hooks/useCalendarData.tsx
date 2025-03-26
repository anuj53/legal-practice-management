
import { useEffect } from 'react';
import { 
  generateDemoCalendars, 
  generateDemoEvents 
} from '@/utils/calendarUtils';
import {
  fetchCalendars,
  fetchEvents,
} from '@/api/calendarAPI';
import { useCalendar } from './useCalendar';

export { useCalendar };
export type { Calendar, Event } from './useCalendar';

export const useCalendarData = () => {
  const {
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
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();
  
  // Fetch calendars
  useEffect(() => {
    const loadCalendars = async () => {
      try {
        console.log('Loading calendars...');
        // First try to fetch from database
        const result = await fetchCalendars();
        
        // If we have data from database, use it
        if (result) {
          console.log('Setting calendars from database');
          setMyCalendars(result.myCalendars);
          setOtherCalendars(result.otherCalendars);
        } else {
          // Fall back to demo data if no database records
          console.log('No calendars found in DB, using demo data');
          const { myCalendars, otherCalendars } = generateDemoCalendars();
          setMyCalendars(myCalendars);
          setOtherCalendars(otherCalendars);
        }
      } catch (err) {
        console.error('Error in fetchCalendars:', err);
        setError('Failed to load calendars');
        
        // Fall back to demo data on error
        const { myCalendars, otherCalendars } = generateDemoCalendars();
        setMyCalendars(myCalendars);
        setOtherCalendars(otherCalendars);
      }
    };

    loadCalendars();
  }, [dataUpdated, setMyCalendars, setOtherCalendars, setError]); // Refetch when data is updated

  // Fetch events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('Loading events...');
        setLoading(true);
        
        // First try to fetch from the database
        const result = await fetchEvents();
        
        // If we have data from database, use it
        if (result && result.length > 0) {
          console.log(`Setting ${result.length} events from database`);
          setEvents(result);
        } else {
          // Fall back to demo data if no database records
          console.log('No events found in DB, using demo data');
          const demoEvents = generateDemoEvents();
          console.log(`Generated ${demoEvents.length} demo events`);
          setEvents(demoEvents);
        }
      } catch (err) {
        console.error('Error in fetchEvents:', err);
        setError('Failed to load events');
        
        // Fall back to demo data on error
        console.log('Using demo events due to error');
        const demoEvents = generateDemoEvents();
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [dataUpdated, setEvents, setLoading, setError]); // Refetch when data is updated

  return {
    myCalendars,
    otherCalendars,
    events,
    loading,
    error,
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
