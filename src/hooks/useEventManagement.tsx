
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';
import { toast } from 'sonner';
import { roundToNextHalfHour } from '@/utils/timeUtils';

export function useEventManagement() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  
  const {
    myCalendars,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();
  
  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
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
    selectedEvent,
    setSelectedEvent,
    modalOpen,
    setModalOpen,
    modalMode,
    setModalMode,
    handleEventClick,
    handleCreateEventAtTime,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
  };
}
