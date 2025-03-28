
import { useState } from 'react';
import { CalendarEvent, RecurrencePattern } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';
import { useRecurringEvents } from '@/hooks/useRecurringEvents';
import { toast } from 'sonner';
import { roundToNextHalfHour } from '@/utils/timeUtils';

export function useEventManagement() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [recurrenceEditMode, setRecurrenceEditMode] = useState<'single' | 'future' | 'all'>('single');
  
  const {
    myCalendars,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();
  
  const {
    makeEventRecurring,
    makeEventNonRecurring
  } = useRecurringEvents();
  
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
  
  const handleSaveEvent = async (event: CalendarEvent, recurrencePattern?: RecurrencePattern) => {
    console.log("handleSaveEvent called with event:", event);
    console.log("Current modal mode:", modalMode);
    console.log("Recurrence pattern:", recurrencePattern);
    
    try {
      if (modalMode === 'create') {
        console.log("Creating new event");
        
        if (!event.calendar) {
          console.error("Missing calendar ID for new event");
          toast.error("Cannot save: Missing calendar ID");
          return;
        }
        
        const { id, calendarColor, ...eventWithoutId } = event;
        
        let newEvent = await createEvent(eventWithoutId);
        
        // If this is a recurring event, make it recurring
        if (recurrencePattern && newEvent) {
          newEvent = await makeEventRecurring(newEvent, recurrencePattern);
        }
        
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } 
      else if (event.isRecurring && recurrenceEditMode !== 'single') {
        // Handle editing recurring events
        console.log(`Updating ${recurrenceEditMode === 'all' ? 'all occurrences' : 'future occurrences'} of recurring event`);
        
        // For simplicity, we're just updating this occurrence for now
        console.log("Updating recurring event instance. In a production system, we would handle the recurrence properly");
        
        const { calendarColor, ...eventToUpdate } = event;
        const updatedEvent = await updateEvent(eventToUpdate);
        
        toast.success('Recurring event updated successfully!');
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
        
        // Update recurrence settings
        if (recurrencePattern && !event.isRecurring) {
          // Make the event recurring
          const updatedEvent = await makeEventRecurring(eventToUpdate, recurrencePattern);
          toast.success('Event updated with recurring settings!');
        } else if (event.isRecurring && !recurrencePattern) {
          // Remove recurrence from the event
          const updatedEvent = await makeEventNonRecurring(eventToUpdate);
          toast.success('Recurring settings removed from event!');
        } else {
          // Normal update
          const updatedEvent = await updateEvent(eventToUpdate);
          toast.success('Event updated successfully!');
        }
        
        console.log("Event updated");
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleDeleteEvent = async (id: string, recurrenceEditMode?: 'single' | 'future' | 'all') => {
    console.log("Deleting event:", id);
    console.log("Recurrence edit mode:", recurrenceEditMode);
    
    try {
      if (recurrenceEditMode && recurrenceEditMode !== 'single') {
        // Handle deleting recurring events
        console.log(`Deleting ${recurrenceEditMode === 'all' ? 'all occurrences' : 'future occurrences'} of recurring event`);
        
        // For simplicity, we're just deleting this occurrence for now
        console.log("Deleting recurring event instance. In a production system, we would handle the recurrence properly");
      }
      
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
    recurrenceEditMode,
    setRecurrenceEditMode,
    handleEventClick,
    handleCreateEventAtTime,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
  };
}
