import { useState } from 'react';
import { CalendarEvent, Calendar, CalendarViewType, CalendarShare } from '@/types/calendar';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Sample colors for new calendars
const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#A855F7', // violet
];

// Function to get a random color from the array
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * defaultColors.length);
  return defaultColors[randomIndex];
};

export function useCalendar() {
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([
    {
      id: '1',
      name: 'Personal',
      color: '#3B82F6',
      checked: true,
    },
    {
      id: '2',
      name: 'Work',
      color: '#10B981',
      checked: true,
    }
  ]);
  
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([
    {
      id: '3',
      name: 'Team',
      color: '#F59E0B',
      checked: false,
    },
    {
      id: '4',
      name: 'Holidays',
      color: '#EF4444',
      checked: false,
    }
  ]);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 30, 0, 0)),
      calendar: '2', // Work calendar
      type: 'internal-meeting', // Changed from 'meeting' to 'internal-meeting'
      location: 'Conference Room A',
      description: 'Weekly team sync-up',
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      start: new Date(new Date().setHours(14, 0, 0, 0)),
      end: new Date(new Date().setHours(15, 0, 0, 0)),
      calendar: '1', // Personal calendar
      type: 'personal', // Changed from 'appointment' to 'personal'
      location: 'Medical Center',
      description: 'Annual check-up',
    },
    {
      id: '3',
      title: 'Project Deadline',
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
      calendar: '2', // Work calendar
      type: 'deadline',
      isAllDay: true,
      description: 'Final submission for client project',
    }
  ]);

  // Toggle calendar visibility
  const toggleCalendar = (id: string) => {
    // Check if it's in myCalendars
    const myCalIndex = myCalendars.findIndex(cal => cal.id === id);
    if (myCalIndex !== -1) {
      const updatedCalendars = [...myCalendars];
      updatedCalendars[myCalIndex] = {
        ...updatedCalendars[myCalIndex],
        checked: !updatedCalendars[myCalIndex].checked
      };
      setMyCalendars(updatedCalendars);
      return;
    }
    
    // Check if it's in otherCalendars
    const otherCalIndex = otherCalendars.findIndex(cal => cal.id === id);
    if (otherCalIndex !== -1) {
      const updatedCalendars = [...otherCalendars];
      updatedCalendars[otherCalIndex] = {
        ...updatedCalendars[otherCalIndex],
        checked: !updatedCalendars[otherCalIndex].checked
      };
      setOtherCalendars(updatedCalendars);
    }
  };

  // Create new calendar
  const createCalendar = (calendar: Omit<Calendar, 'id'>) => {
    try {
      const newCalendar: Calendar = {
        ...calendar,
        id: uuidv4(),
        color: calendar.color || getRandomColor(),
        checked: true,
      };
      
      setMyCalendars([...myCalendars, newCalendar]);
      toast.success(`Calendar "${calendar.name}" created successfully`);
      return newCalendar;
    } catch (error) {
      console.error('Error creating calendar:', error);
      toast.error('Failed to create calendar');
      throw error;
    }
  };
  
  // Update calendar
  const updateCalendar = (calendar: Calendar) => {
    try {
      const calendarIndex = myCalendars.findIndex(cal => cal.id === calendar.id);
      
      if (calendarIndex !== -1) {
        const updatedCalendars = [...myCalendars];
        updatedCalendars[calendarIndex] = calendar;
        setMyCalendars(updatedCalendars);
        toast.success(`Calendar "${calendar.name}" updated successfully`);
        return calendar;
      } else {
        throw new Error('Calendar not found');
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error('Failed to update calendar');
      throw error;
    }
  };
  
  // Delete calendar
  const deleteCalendar = (id: string) => {
    try {
      const calendarExists = myCalendars.some(cal => cal.id === id);
      
      if (!calendarExists) {
        throw new Error('Calendar not found');
      }
      
      // Remove calendar
      setMyCalendars(myCalendars.filter(cal => cal.id !== id));
      
      // Remove events associated with this calendar
      setEvents(events.filter(event => event.calendar !== id));
      
      toast.success('Calendar deleted successfully');
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast.error('Failed to delete calendar');
      throw error;
    }
  };
  
  // Create event
  const createEvent = (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent: CalendarEvent = {
        ...event,
        id: uuidv4(),
      };
      
      setEvents([...events, newEvent]);
      toast.success('Event created successfully');
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };
  
  // Update event
  const updateEvent = (event: CalendarEvent) => {
    try {
      const eventIndex = events.findIndex(e => e.id === event.id);
      
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = event;
        setEvents(updatedEvents);
        toast.success('Event updated successfully');
        return event;
      } else {
        throw new Error('Event not found');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };
  
  // Delete event
  const deleteEvent = (id: string) => {
    try {
      const eventExists = events.some(event => event.id === id);
      
      if (!eventExists) {
        throw new Error('Event not found');
      }
      
      setEvents(events.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };

  return {
    myCalendars,
    otherCalendars,
    events,
    loading: false,
    error: null,
    toggleCalendar,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
