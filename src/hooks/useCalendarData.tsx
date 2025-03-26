
import { useEffect } from 'react';
import { 
  generateDemoCalendars, 
  generateDemoEvents,
  isValidUUID
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
          console.log('My calendars from DB:', result.myCalendars.map(c => `${c.id} (${c.name})`));
          
          // Validate calendar IDs
          const validMyCalendars = result.myCalendars.filter(cal => isValidUUID(cal.id));
          const validOtherCalendars = result.otherCalendars.filter(cal => isValidUUID(cal.id));
          
          if (validMyCalendars.length === 0) {
            console.warn('No valid calendar IDs found in DB data, using demo data instead');
            const { myCalendars, otherCalendars } = generateDemoCalendars();
            setMyCalendars(myCalendars);
            setOtherCalendars(otherCalendars);
          } else {
            setMyCalendars(validMyCalendars);
            setOtherCalendars(validOtherCalendars);
          }
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
          
          // Validate event calendar IDs
          const validEvents = result.filter(event => isValidUUID(event.calendar));
          
          if (validEvents.length === 0) {
            console.warn('No valid event calendar IDs found in DB data, using demo data instead');
            // Pass the actual calendars to use their IDs
            const allCalendars = [...myCalendars, ...otherCalendars];
            const demoEvents = generateDemoEvents(allCalendars);
            setEvents(demoEvents);
          } else {
            setEvents(validEvents);
          }
        } else {
          // Fall back to demo data if no database records
          console.log('No events found in DB, using demo data');
          // Pass the actual calendars to use their IDs
          const allCalendars = [...myCalendars, ...otherCalendars];
          const demoEvents = generateDemoEvents(allCalendars);
          console.log(`Generated ${demoEvents.length} demo events with actual calendar IDs`);
          setEvents(demoEvents);
        }
      } catch (err) {
        console.error('Error in fetchEvents:', err);
        setError('Failed to load events');
        
        // Fall back to demo data on error
        console.log('Using demo events due to error');
        // Pass the actual calendars to use their IDs
        const allCalendars = [...myCalendars, ...otherCalendars];
        const demoEvents = generateDemoEvents(allCalendars);
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    };

    // Only load events if we have calendars
    if (myCalendars.length > 0 || otherCalendars.length > 0) {
      loadEvents();
    }
  }, [dataUpdated, myCalendars, otherCalendars, setEvents, setLoading, setError]); // Refetch when data is updated or calendars change

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
