
import { useState, useEffect } from 'react';
import { CalendarViewType } from '@/types/calendar';
import { Calendar, Event } from '@/utils/calendarUtils';
import { useCalendar } from '@/hooks/useCalendar';
import { toast } from 'sonner';

export function useCalendarPage() {
  console.log('Using useCalendarPage with real database hook');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const {
    myCalendars = [],
    otherCalendars = [],
    events = [],
    loading = false,
    createEvent,
    updateEvent,
    deleteEvent,
    createCalendar,
    updateCalendar,
    deleteCalendar
  } = useCalendar();
  
  console.log('useCalendarPage: myCalendars received from useCalendar hook:', 
    myCalendars.map(cal => ({id: cal.id, name: cal.name, color: cal.color, checked: cal.checked}))
  );
  
  const filteredEvents = events.filter(event => {
    const calendar = [...(myCalendars || []), ...(otherCalendars || [])].find(cal => cal.id === event.calendar);
    return calendar && calendar.checked;
  });
  
  useEffect(() => {
    console.log('Filtered events:', filteredEvents.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      event_type_id: e.event_type_id,
      calendarId: e.calendar,
      calendar: [...(myCalendars || []), ...(otherCalendars || [])].find(cal => cal.id === e.calendar)?.name
    })));
  }, [filteredEvents, myCalendars, otherCalendars]);
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    const calendarList = category === 'my' ? myCalendars : otherCalendars;
    const calendar = calendarList.find(cal => cal.id === id);
    
    if (calendar) {
      const updatedCalendar = {
        ...calendar,
        checked: !calendar.checked
      };
      
      updateCalendar(updatedCalendar);
    }
  };
  
  const handleEventClick = (event: Event) => {
    console.log("Event clicked:", event);
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
  };
  
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };
  
  const handleCreateEvent = () => {
    console.log("Create event clicked");
    
    const defaultCalendarId = myCalendars.length > 0 ? myCalendars[0].id : '';
    
    if (!defaultCalendarId) {
      toast.error("Cannot create event: No calendars available");
      return;
    }
    
    const now = new Date();
    const defaultEvent: Omit<Event, 'id'> = {
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000),
      type: 'meeting',
      calendar: defaultCalendarId,
      isAllDay: false,
      description: '',
      location: '',
    };
    
    setSelectedEvent(defaultEvent as Event);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleCreateCalendar = (calendar: Omit<Calendar, 'id'>) => {
    console.log("Create calendar:", calendar);
    try {
      if (calendar.sharedWith && calendar.sharedWith.length > 0) {
        console.log("Calendar shared with:", calendar.sharedWith);
      }
      
      const newCalendar = createCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" created successfully!`);
      return newCalendar;
    } catch (error) {
      console.error('Error creating calendar:', error);
      toast.error(`Failed to create calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleUpdateCalendar = (calendar: Calendar) => {
    console.log("Update calendar:", calendar);
    try {
      updateCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" updated successfully!`);
      return calendar;
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error(`Failed to update calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleDeleteCalendar = (id: string) => {
    console.log("Delete calendar:", id);
    try {
      deleteCalendar(id);
      toast.success('Calendar deleted successfully!');
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast.error(`Failed to delete calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleSaveEvent = async (event: Event) => {
    console.log("handleSaveEvent called with event:", event);
    console.log("Current modal mode:", modalMode);
    console.log("Event type:", event.type);
    console.log("Event type_id:", event.event_type_id);
    
    if (event.isRecurring && event.recurrencePattern) {
      console.log("Recurrence pattern:", {
        frequency: event.recurrencePattern.frequency,
        interval: event.recurrencePattern.interval,
        occurrences: event.recurrencePattern.occurrences,
        endDate: event.recurrencePattern.endDate
      });
    }
    
    try {
      if (modalMode === 'create') {
        console.log("Creating new event");
        
        if (!event.calendar) {
          console.error("Missing calendar ID for new event");
          toast.error("Cannot save: Missing calendar ID");
          return;
        }
        
        const { id, ...eventWithoutId } = event;
        
        const eventToCreate = {
          ...eventWithoutId,
          isRecurring: !!event.isRecurring,
          recurrencePattern: event.recurrencePattern || undefined
        };
        
        const newEvent = await createEvent(eventToCreate);
        
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } 
      else {
        console.log("Updating existing event with ID:", event.id);
        console.log("Event calendar ID:", event.calendar);
        console.log("Event type for update:", event.type);
        console.log("Event type_id for update:", event.event_type_id);
        
        if (!event.id) {
          console.error("Missing event ID for update");
          toast.error("Cannot update event: Missing ID");
          return;
        }
        
        if (!event.calendar) {
          console.error("Missing calendar ID for event update");
          toast.error("Cannot update event: Missing calendar ID");
          return;
        }
        
        const eventToUpdate = {
          ...event,
          isRecurring: !!event.isRecurring,
          recurrencePattern: event.recurrencePattern || undefined
        };
        
        const updatedEvent = await updateEvent(eventToUpdate);
        toast.success('Event updated successfully!');
        console.log("Event updated:", updatedEvent);
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    console.log("Deleting event:", id);
    
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully!');
      setModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    selectedEvent,
    setSelectedEvent,
    modalOpen,
    setModalOpen,
    modalMode,
    setModalMode,
    myCalendars,
    otherCalendars,
    events: filteredEvents,
    loading,
    handleCalendarToggle,
    handleEventClick,
    handleDayClick,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  };
}
