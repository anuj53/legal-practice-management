
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Event,
} from '@/utils/calendarUtils';
import {
  fetchCalendars,
  fetchEvents,
  updateCalendarInDb,
  createCalendarInDb,
  createEventInDb,
  updateEventInDb,
  deleteEventFromDb
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
      // First create in the database
      const newEvent = await createEventInDb(event);
      
      // Update local state
      setEvents(prev => [...prev, newEvent]);
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      toast.error('Failed to create event');
      
      // Fall back to client-side ID generation for demo mode
      const newEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 9),
      } as Event;
      
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    }
  };

  // Update event
  const updateEvent = async (event: Event) => {
    try {
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
      toast.error('Failed to update event');
      
      // Still update the local state so UI stays consistent
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
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
      toast.error('Failed to delete event');
      
      // Still update the local state so UI stays consistent
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
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
