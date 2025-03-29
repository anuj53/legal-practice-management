
import { useState } from 'react';
import { CalendarEvent, Calendar, CalendarViewType, CalendarShare } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';
import { toast } from 'sonner';

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const {
    myCalendars,
    otherCalendars,
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    createCalendar,
    updateCalendar,
    deleteCalendar
  } = useCalendar();
  
  // Get only events from selected calendars
  const filteredEvents = events.filter(event => {
    const calendar = [...myCalendars, ...otherCalendars].find(cal => cal.id === event.calendar);
    return calendar && calendar.checked;
  });
  
  const handleCalendarToggle = (id: string) => {
    const calendarList = [...myCalendars, ...otherCalendars];
    const calendar = calendarList.find(cal => cal.id === id);
    
    if (calendar) {
      const updatedCalendar = {
        ...calendar,
        checked: !calendar.checked
      };
      
      updateCalendar(updatedCalendar);
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
    
    // Use the first calendar ID
    const defaultCalendarId = myCalendars.length > 0 ? myCalendars[0].id : '';
    
    if (!defaultCalendarId) {
      toast.error("Cannot create event: No calendars available");
      return;
    }
    
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
    
    setSelectedEvent(defaultEvent as CalendarEvent);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleCreateCalendar = (calendar: Omit<Calendar, 'id'>) => {
    console.log("Create calendar:", calendar);
    try {
      // Handle sharing permissions
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
        
        // Create a properly typed object without 'id' property
        const { id, ...eventWithoutId } = event;
        
        // Use the correctly typed object for createEvent
        const newEvent = createEvent(eventWithoutId);
        
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } 
      // For existing events in edit mode
      else {
        console.log("Updating existing event with ID:", event.id);
        console.log("Event calendar ID:", event.calendar);
        
        // Validate both event ID and calendar ID
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
        
        // Update event
        const updatedEvent = updateEvent(event);
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
      deleteEvent(id);
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
    loading: false,
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
