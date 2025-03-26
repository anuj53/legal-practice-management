
import { useState, useEffect } from 'react';
import { Event } from '@/utils/calendarUtils';
import { useCalendarData } from '@/hooks/useCalendarData';
import { toast } from 'sonner';
import { CalendarView } from '@/components/calendar/CalendarHeader';

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const {
    myCalendars,
    otherCalendars,
    events,
    loading,
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendarData();
  
  useEffect(() => {
    console.log("useCalendarPage - events received:", events.length);
    console.log("useCalendarPage - myCalendars:", myCalendars.length);
    console.log("useCalendarPage - otherCalendars:", otherCalendars.length);
    
    if (myCalendars.length > 0) {
      console.log("First calendar:", myCalendars[0].id, myCalendars[0].name);
    }
    
    if (events.length > 0) {
      console.log("Sample event calendar ID:", events[0].calendar);
    }
  }, [events, myCalendars, otherCalendars]);
  
  const calendarNameToIdMap = () => {
    const map: Record<string, string> = {};
    
    myCalendars.forEach(cal => {
      if (cal.is_firm) map['firm'] = cal.id;
      else if (cal.is_statute) map['statute'] = cal.id;
      else map['personal'] = cal.id;
    });
    
    [...myCalendars, ...otherCalendars].forEach(cal => {
      map[cal.id] = cal.id;
    });
    
    console.log("Calendar mapping:", map);
    return map;
  };
  
  const filteredEvents = events.filter(event => {
    const mapping = calendarNameToIdMap();
    const actualCalendarId = mapping[event.calendar] || event.calendar;
    
    console.log("Mapping event:", event.title, "Original calendar:", event.calendar, "Mapped calendar:", actualCalendarId);
    
    const allCalendars = [...myCalendars, ...otherCalendars];
    const calendar = allCalendars.find(cal => cal.id === actualCalendarId);
    
    if (!calendar) {
      console.log("Calendar not found for event:", event.title, "Calendar ID:", actualCalendarId);
      return false;
    }
    
    console.log("Event will be displayed:", event.title, "Calendar checked:", calendar.checked);
    return calendar.checked;
  });
  
  useEffect(() => {
    console.log("Filtered events:", filteredEvents.length);
    if (filteredEvents.length > 0) {
      console.log("Sample filtered event:", filteredEvents[0].title);
    }
  }, [filteredEvents]);
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    if (category === 'my') {
      const calendar = myCalendars.find(cal => cal.id === id);
      if (calendar) {
        updateCalendar({
          ...calendar,
          checked: !calendar.checked
        });
      }
    } else {
      const calendar = otherCalendars.find(cal => cal.id === id);
      if (calendar) {
        const updatedCalendar = {
          ...calendar,
          checked: !calendar.checked
        };
        updateCalendar(updatedCalendar);
      }
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
    
    // Get first available calendar or use a placeholder ID
    const defaultCalendarId = myCalendars.length > 0 
      ? myCalendars[0].id 
      : '';
    
    console.log("Using default calendar ID for new event:", defaultCalendarId);
    
    // Validate calendar ID to ensure it's a valid UUID
    if (defaultCalendarId && !isValidUUID(defaultCalendarId)) {
      console.error("Default calendar ID is not a valid UUID:", defaultCalendarId);
      toast.error("Cannot create event: Invalid calendar ID");
      return;
    }
    
    const now = new Date();
    const defaultEvent = {
      id: '',
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000),
      type: 'client-meeting' as const,
      calendar: defaultCalendarId,
      isAllDay: false,
      description: '',
      location: '',
    };
    
    setSelectedEvent(defaultEvent as Event);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleSaveEvent = async (event: Event) => {
    console.log("Saving event:", event);
    
    // Enhanced validation before save
    if (modalMode === 'edit' && !isValidUUID(event.id)) {
      console.error("Invalid event ID format for edit:", event.id);
      toast.error('Cannot save: Invalid event ID format');
      return;
    }
    
    // Ensure calendar ID is a valid UUID
    if (!isValidUUID(event.calendar)) {
      console.error("Invalid calendar ID format:", event.calendar);
      toast.error('Cannot save: Invalid calendar ID format');
      return;
    }
    
    try {
      if (modalMode === 'create') {
        console.log("Creating new event");
        const newEvent = await createEvent(event);
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } else {
        console.log("Updating event with ID:", event.id);
        
        const updatedEvent = await updateEvent(event);
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
    
    // Validate UUID before attempting to delete
    if (!isValidUUID(id)) {
      console.error("Invalid event ID for deletion:", id);
      toast.error('Cannot delete: Invalid event ID format');
      return;
    }
    
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully!');
      setModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const isValidUUID = (id: string): boolean => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
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
    handleDeleteEvent
  };
}
