import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
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
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if data has been updated to trigger a re-fetch
  const [dataUpdated, setDataUpdated] = useState(0);

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
      toast.error('Failed to create calendar');
      
      // Fall back to client-side ID generation for demo mode
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
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
      if (!event.calendar || !isValidUUID(event.calendar)) {
        const msg = `Invalid calendar ID: ${event.calendar}`;
        console.error(msg);
        throw new Error(msg);
      }
      
      // Set isRecurring flag based on recurrencePattern
      const isRecurring = !!event.recurrencePattern;
      const eventWithRecurringFlag = {
        ...event,
        isRecurring
      };
      
      console.log('useCalendar: Creating event with recurrence pattern:', 
        event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : 'none');
      
      // First create in the database
      const newEvent = await createEventInDb(eventWithRecurringFlag);
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
      
      // Set isRecurring flag based on recurrencePattern
      const isRecurring = !!event.recurrencePattern;
      const eventWithRecurringFlag = {
        ...event,
        isRecurring
      };
      
      // First update in the database
      const updatedEvent = await updateEventInDb(eventWithRecurringFlag);
      
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
      
      // Find the event we're deleting
      const eventToDelete = events.find(e => e.id === id);
      
      if (!eventToDelete) {
        throw new Error(`Event with ID ${id} not found`);
      }
      
      // Validate UUID before attempting to delete
      if (!isValidUUID(id)) {
        // Special handling for recurring instances
        if (id.includes('_recurrence_') && eventToDelete.parentEventId) {
          console.log('Attempted to delete recurring instance, will delete parent event instead');
          
          // Get the parent event ID from the recurring instance
          const parentId = eventToDelete.parentEventId;
          
          // Find the parent event
          const parentEvent = events.find(e => e.id === parentId);
          
          if (parentEvent && isValidUUID(parentId)) {
            // Delete the parent event which will cascade to all instances
            console.log(`Deleting parent event with ID: ${parentId}`);
            await deleteEventFromDb(parentId);
            
            // Remove parent and all instances from local state
            setEvents(prev => prev.filter(e => e.id !== parentId && e.parentEventId !== parentId));
            
            toast.success('Recurring event deleted successfully!');
            return;
          } else {
            throw new Error(`Parent event with ID ${parentId} not found or has invalid ID`);
          }
        } else {
          const msg = `Invalid event ID format: ${id}`;
          console.error(msg);
          throw new Error(msg);
        }
      }
      
      // First delete from the database
      await deleteEventFromDb(id);
      
      // If this is a recurring parent event, remove all instances too
      if (eventToDelete.isRecurring && eventToDelete.recurrencePattern) {
        // Remove parent and all instances
        setEvents(prev => prev.filter(e => e.id !== id && e.parentEventId !== id));
        toast.success('Recurring event and all instances deleted successfully!');
      } else {
        // Just remove the single event
        setEvents(prev => prev.filter(e => e.id !== id));
        toast.success('Event deleted successfully!');
      }
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
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
    createEvent,
    updateEvent,
    deleteEvent,
    deleteCalendar,
  };
};
