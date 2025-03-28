import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Calendar as CalendarType, 
  Event,
  isValidUUID
} from '@/utils/calendarUtils';
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

export type { Calendar, Event } from '@/utils/calendarUtils';

export const useCalendar = () => {
  const [myCalendars, setMyCalendars] = useState<CalendarType[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<CalendarType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if data has been updated to trigger a re-fetch
  const [dataUpdated, setDataUpdated] = useState(0);

  // Toggle calendar visibility
  const toggleCalendar = (calendarId: string) => {
    // Check if it's in myCalendars
    if (myCalendars.some(cal => cal.id === calendarId)) {
      setMyCalendars(prev => prev.map(calendar => 
        calendar.id === calendarId 
          ? { ...calendar, checked: !calendar.checked } 
          : calendar
      ));
    } else {
      // Must be in otherCalendars
      setOtherCalendars(prev => prev.map(calendar => 
        calendar.id === calendarId 
          ? { ...calendar, checked: !calendar.checked } 
          : calendar
      ));
    }
  };

  // Update calendar
  const updateCalendar = async (calendar: CalendarType) => {
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
  const createCalendar = async (calendar: Omit<CalendarType, 'id'>) => {
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
      
      // Fall back to client-side ID generation for demo mode
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
      } as CalendarType;
      
      setMyCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
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
    currentDate: new Date(),
    selectedDate: new Date(),
    view: 'week' as const,
    calendars: [],
    events,
    myCalendars,
    otherCalendars,
    loading,
    error,
    dataUpdated,
    setCurrentDate: () => {},
    setSelectedDate: () => {},
    setView: () => {},
    goToToday: () => {},
    nextMonth: () => {},
    prevMonth: () => {},
    nextWeek: () => {},
    prevWeek: () => {},
    nextDay: () => {},
    prevDay: () => {},
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
