
import { useState, useEffect } from 'react';
import { addDays, addMonths, subMonths, startOfMonth, isSameDay } from 'date-fns';
import { CalendarEvent, Calendar, CalendarViewType, CalendarShare } from '@/types/calendar';

// Sample data - in a real app, this would come from an API or database
const generateSampleEvents = (calendars: Calendar[]): CalendarEvent[] => {
  const now = new Date();
  const events: CalendarEvent[] = [];
  
  // Generate some events for the current week
  const calendarIds = calendars.map(cal => cal.id);
  
  // Event 1: Today at 12pm
  events.push({
    id: '1',
    title: 'Meeting',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
    type: 'client-meeting',
    calendar: calendarIds[0]
  });
  
  // Event 2: Today at 12pm on a different calendar
  events.push({
    id: '2',
    title: 'Client Call',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
    type: 'client-meeting',
    calendar: calendarIds[1]
  });
  
  // Event 3: Tomorrow at 12pm
  const tomorrow = addDays(now, 1);
  events.push({
    id: '3',
    title: 'Planning Session',
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
      is_firm: false,
      is_statute: false,
      is_public: false,
      sharedWith: []
    },
    {
      id: '2',
      name: 'Work Calendar',
      color: '#4caf50',
      checked: true,
      isSelected: true,
      is_firm: true,
      is_statute: false,
      is_public: false,
      sharedWith: []
    },
    {
      id: '3',
      name: 'Other Calendar',
      color: '#2196f3',
      checked: true,
      isSelected: false,
      is_firm: false,
      is_statute: false,
      is_public: true,
      sharedWith: [
        { user_email: 'colleague@example.com', permission: 'view' }
      ]
    }
  ];
};

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('week');
  const [calendars, setCalendars] = useState<Calendar[]>(generateSampleCalendars());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Split calendars into my and other categories
  const myCalendars = calendars.filter(cal => cal.isSelected !== false);
  const otherCalendars = calendars.filter(cal => cal.isSelected === false);
  
  useEffect(() => {
    // In a real app, you would fetch events from an API
    const sampleEvents = generateSampleEvents(calendars);
    setEvents(sampleEvents);
  }, [calendars]);
  
  // Get only events from visible calendars
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
    
    console.log('Creating new calendar with sharing permissions:', calendar.sharedWith);
    
    setCalendars([...calendars, newCalendar]);
    return newCalendar;
  };

  const updateCalendar = (updatedCalendar: Calendar) => {
    setCalendars(calendars.map(calendar =>
      calendar.id === updatedCalendar.id ? updatedCalendar : calendar
    ));
    return updatedCalendar;
  };

  const deleteCalendar = (calendarId: string) => {
    setCalendars(calendars.filter(calendar => calendar.id !== calendarId));
  };
  
  return {
    currentDate,
    selectedDate,
    view,
    calendars,
    events: visibleEvents,
    myCalendars,
    otherCalendars,
    loading,
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
    createCalendar,
    updateCalendar,
    deleteCalendar
  };
};
