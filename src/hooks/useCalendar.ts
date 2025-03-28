
import { useState, useEffect } from 'react';
import { addDays, addMonths, subMonths, startOfMonth, isSameDay } from 'date-fns';
import { CalendarEvent, Calendar, CalendarViewType } from '@/types/calendar';

// Sample data - in a real app, this would come from an API or database
const generateSampleEvents = (calendars: Calendar[]): CalendarEvent[] => {
  const now = new Date();
  const events: CalendarEvent[] = [];
  
  // Generate some events for the current week
  const calendarIds = calendars.map(cal => cal.id);
  
  // Event 1: Today at 12pm
  events.push({
    id: '1',
    title: 'Event',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
    type: 'client-meeting',
    calendar: calendarIds[0]
  });
  
  // Event 2: Today at 12pm on a different calendar
  events.push({
    id: '2',
    title: 'Client',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
    type: 'client-meeting',
    calendar: calendarIds[1]
  });
  
  // Event 3: Tomorrow at 12pm
  const tomorrow = addDays(now, 1);
  events.push({
    id: '3',
    title: 'Plan',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 13, 0),
    type: 'internal-meeting',
    calendar: calendarIds[0]
  });
  
  return events;
};

const generateSampleCalendars = (): Calendar[] => {
  return [
    {
      id: '1',
      name: 'My Calendar',
      color: '#ff9800',
      checked: true,
      isSelected: true,
      isUserCalendar: true
    },
    {
      id: '2',
      name: 'Work Calendar',
      color: '#4caf50',
      checked: true,
      isSelected: true,
      isUserCalendar: true
    },
    {
      id: '3',
      name: 'Other Calendar',
      color: '#2196f3',
      checked: true,
      isSelected: false,
      isUserCalendar: false
    }
  ];
};

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('week');
  const [calendars, setCalendars] = useState<Calendar[]>(generateSampleCalendars());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  useEffect(() => {
    // In a real app, you would fetch events from an API
    const sampleEvents = generateSampleEvents(calendars);
    setEvents(sampleEvents);
  }, [calendars]);
  
  const visibleEvents = events.filter(event => {
    const calendar = calendars.find(cal => cal.id === event.calendar);
    return calendar && calendar.checked;
  });
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };
  
  const prevDay = () => {
    setCurrentDate(addDays(currentDate, -1));
  };
  
  const toggleCalendar = (calendarId: string) => {
    setCalendars(calendars.map(calendar => 
      calendar.id === calendarId 
        ? { ...calendar, checked: !calendar.checked } 
        : calendar
    ));
  };
  
  const createEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    setEvents([...events, newEvent]);
    return newEvent;
  };
  
  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    return updatedEvent;
  };
  
  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };
  
  const createCalendar = (calendar: Omit<Calendar, 'id'>) => {
    // Generate a random ID for the new calendar
    const newCalendar: Calendar = {
      ...calendar,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    setCalendars([...calendars, newCalendar]);
    return newCalendar;
  };
  
  return {
    currentDate,
    selectedDate,
    view,
    calendars,
    events: visibleEvents,
    setCurrentDate,
    setSelectedDate,
    setView,
    goToToday,
    nextMonth,
    prevMonth,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    toggleCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    createCalendar
  };
};
