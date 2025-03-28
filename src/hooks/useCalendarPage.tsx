
import { useState } from 'react';
import { CalendarEvent, Calendar, CalendarViewType } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';
import { toast } from 'sonner';

// Helper function to round time to the nearest half hour
const roundToNextHalfHour = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedDate = new Date(date);
  
  if (minutes < 30) {
    // Round to next half hour
    roundedDate.setMinutes(30, 0, 0);
  } else {
    // Round to next hour
    roundedDate.setHours(date.getHours() + 1, 0, 0, 0);
  }
  
  return roundedDate;
};

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const {
    myCalendars,
    otherCalendars,
    events: rawEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleCalendar,
    createCalendar,
    updateCalendar,
    deleteCalendar, 
  } = useCalendar();
  
  // Enhanced events with calendar color information
  const events = rawEvents.map(event => {
    const calendar = [...myCalendars, ...otherCalendars].find(cal => cal.id === event.calendar);
    return {
      ...event,
      calendarColor: calendar?.color || '#9CA3AF' // Default gray color if calendar not found
    };
  });
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    toggleCalendar(id);
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
  };
  
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    
    if (currentView === 'month') {
      setCurrentView('day');
    } else {
      handleCreateEventAtTime(date);
    }
  };
  
  const handleCreateEventAtTime = (startTime: Date) => {
    console.log("Create event at time:", startTime);
    
    const defaultCalendarId = myCalendars.length > 0 ? myCalendars[0].id : '';
    
    if (!defaultCalendarId) {
      toast.error("Cannot create event: No calendars available");
      return;
    }
    
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    
    const defaultEvent: Omit<CalendarEvent, 'id'> = {
      title: '',
      start: startTime,
      end: endTime,
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
  
  const handleCreateEvent = () => {
    console.log("Create event clicked");
    
    const defaultCalendarId = myCalendars.length > 0 ? myCalendars[0].id : '';
    
    if (!defaultCalendarId) {
      toast.error("Cannot create event: No calendars available");
      return;
    }
    
    const now = new Date();
    const roundedStartTime = roundToNextHalfHour(now);
    const endTime = new Date(roundedStartTime.getTime() + 60 * 60 * 1000);
    
    const defaultEvent: Omit<CalendarEvent, 'id'> = {
      title: '',
      start: roundedStartTime,
      end: endTime,
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
      if (calendar.sharedWith && calendar.sharedWith.length > 0) {
        console.log("Calendar shared with:", calendar.sharedWith);
      }
      
      const newCalendar = createCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" created successfully!`);
      return newCalendar;
    } catch (error) {
      console.error('Error creating calendar:', error);
      toast.error(`Failed to create calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleUpdateCalendar = (calendar: Calendar) => {
    console.log("Update calendar:", calendar);
    try {
      if (calendar.sharedWith && calendar.sharedWith.length > 0) {
        console.log("Calendar shared with:", calendar.sharedWith);
      }
      
      updateCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" updated successfully!`);
      return calendar;
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error(`Failed to update calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };
  
  const handleDeleteCalendar = (id: string) => {
    console.log("Delete calendar:", id);
    try {
      deleteCalendar(id);
      toast.success("Calendar deleted successfully!");
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast.error(`Failed to delete calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };
  
  const handleSaveEvent = async (event: CalendarEvent) => {
    console.log("handleSaveEvent called with event:", event);
    console.log("Current modal mode:", modalMode);
    
    try {
      if (modalMode === 'create') {
        console.log("Creating new event");
        
        if (!event.calendar) {
          console.error("Missing calendar ID for new event");
          toast.error("Cannot save: Missing calendar ID");
          return;
        }
        
        const { id, calendarColor, ...eventWithoutId } = event;
        
        const newEvent = createEvent(eventWithoutId);
        
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } 
      else {
        console.log("Updating existing event with ID:", event.id);
        console.log("Event calendar ID:", event.calendar);
        
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
        
        // Regular event update
        const { calendarColor, ...eventToUpdate } = event;
        
        const updatedEvent = updateEvent(eventToUpdate);
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
    events,
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
