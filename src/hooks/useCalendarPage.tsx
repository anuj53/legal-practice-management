
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarData } from '@/hooks/useCalendarData';
import { toast } from 'sonner';
import { CalendarView } from '@/components/calendar/CalendarHeader';
import { isValidUUID } from '@/utils/calendarUtils';

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
    
    [...myCalendars, ...otherCalendars].forEach(cal => {
      map[cal.id] = cal.id; // Map each ID to itself for direct lookup
      
      // Also add special mappings for certain calendar types
      if (cal.is_firm) map['firm'] = cal.id;
      else if (cal.is_statute) map['statute'] = cal.id;
      else if (!cal.is_firm && !cal.is_statute) map['personal'] = cal.id;
    });
    
    console.log("Calendar mapping:", map);
    return map;
  };
  
  const filteredEvents = events.filter(event => {
    const mapping = calendarNameToIdMap();
    let actualCalendarId = event.calendar;
    
    // Try to resolve special names to IDs if necessary
    if (mapping[event.calendar] && !isValidUUID(event.calendar)) {
      actualCalendarId = mapping[event.calendar];
      console.log(`Mapped special calendar name "${event.calendar}" to ID "${actualCalendarId}"`);
    }
    
    const allCalendars = [...myCalendars, ...otherCalendars];
    const calendar = allCalendars.find(cal => cal.id === actualCalendarId);
    
    if (!calendar) {
      console.log("Calendar not found for event:", event.title, "Calendar ID:", actualCalendarId);
      return false;
    }
    
    return calendar.checked;
  });
  
  useEffect(() => {
    console.log("Filtered events:", filteredEvents.length);
    if (filteredEvents.length > 0) {
      console.log("Sample filtered event:", filteredEvents[0].title);
    }
  }, [filteredEvents]);
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    const calendars = category === 'my' ? myCalendars : otherCalendars;
    const calendar = calendars.find(cal => cal.id === id);
    
    if (calendar) {
      updateCalendar({
        ...calendar,
        checked: !calendar.checked
      });
    }
  };
  
  const handleEventClick = (event: CalendarEvent) => {
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
    
    // Get valid calendars (with valid UUID format)
    const validCalendars = myCalendars.filter(cal => isValidUUID(cal.id));
    
    console.log("Valid calendars found:", validCalendars.map(c => `${c.id} (${c.name})`));
    
    if (validCalendars.length === 0) {
      console.error("No valid calendars found for creating a new event");
      toast.error("Cannot create event: No valid calendars available");
      return;
    }
    
    // Use the first valid calendar ID
    const defaultCalendarId = validCalendars[0].id;
    
    console.log("Using default calendar ID for new event:", defaultCalendarId);
    console.log("Calendar validation check:", isValidUUID(defaultCalendarId));
    
    const now = new Date();
    const defaultEvent: Omit<CalendarEvent, 'id'> = {
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000),
      type: 'client-meeting',
      calendar: defaultCalendarId,
      isAllDay: false,
      description: '',
      location: '',
    };
    
    console.log("Created default event with calendar ID:", defaultEvent.calendar);
    setSelectedEvent(defaultEvent as CalendarEvent);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleSaveEvent = async (event: CalendarEvent) => {
    console.log("handleSaveEvent called with event:", event);
    console.log("Current modal mode:", modalMode);
    
    try {
      // For new events in create mode
      if (modalMode === 'create') {
        console.log("Creating new event");
        
        // Validate calendar ID
        if (!event.calendar) {
          console.error("Missing calendar ID for new event");
          toast.error("Cannot save: Missing calendar ID");
          return;
        }
        
        if (!isValidUUID(event.calendar)) {
          console.error("Invalid calendar ID format for new event:", event.calendar);
          toast.error("Cannot save: Invalid calendar ID format");
          return;
        }
        
        // Fixed: Create a properly typed object without 'id' property
        const { id, ...eventWithoutId } = event;
        
        // Use the correctly typed object for createEvent
        const newEvent = await createEvent(eventWithoutId as Omit<CalendarEvent, 'id'>);
        
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } 
      // For existing events in edit mode
      else {
        console.log("Updating existing event with ID:", event.id);
        
        // Validate both event ID and calendar ID
        if (!event.id) {
          console.error("Missing event ID for update");
          toast.error("Cannot update event: Missing ID");
          return;
        }
        
        if (!isValidUUID(event.id)) {
          console.error("Invalid event ID format for update:", event.id);
          toast.error("Cannot update event: Invalid ID format");
          return;
        }
        
        if (!event.calendar) {
          console.error("Missing calendar ID for event update");
          toast.error("Cannot update event: Missing calendar ID");
          return;
        }
        
        if (!isValidUUID(event.calendar)) {
          console.error("Invalid calendar ID format for update:", event.calendar);
          toast.error("Cannot save: Invalid calendar ID format");
          return;
        }
        
        // Update with valid IDs
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
    isValidUUID
  };
}
