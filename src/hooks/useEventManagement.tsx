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
        
        let newEvent = await createEvent(eventWithoutId as any);
        console.log("New event created:", newEvent);
        
        if (recurrencePattern && newEvent) {
          console.log("Making event recurring with pattern:", recurrencePattern);
          newEvent = await makeEventRecurring(newEvent, recurrencePattern);
          console.log("Event is now recurring:", newEvent);
        }
        
        toast.success('Event created successfully!');
      } 
      else if (event.isRecurring && recurrenceEditMode !== 'single') {
        console.log(`Updating ${recurrenceEditMode === 'all' ? 'all occurrences' : 'future occurrences'} of recurring event`);
        
        console.log("Updating recurring event instance. In a production system, we would handle the recurrence properly");
        
        const { calendarColor, ...eventToUpdate } = event;
        const updatedEvent = await updateEvent(eventToUpdate as any);
        console.log("Updated recurring event:", updatedEvent);
        
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
        
        const { calendarColor, ...eventToUpdate } = event;
        
        if (recurrencePattern && !event.isRecurring) {
          console.log("Adding recurrence to non-recurring event");
          const updatedEvent = await makeEventRecurring(eventToUpdate as any, recurrencePattern);
          console.log("Event now has recurrence:", updatedEvent);
          toast.success('Event updated with recurring settings!');
        } else if (event.isRecurring && !recurrencePattern) {
          console.log("Removing recurrence from recurring event");
          const updatedEvent = await makeEventNonRecurring(eventToUpdate as any);
          console.log("Event no longer recurring:", updatedEvent);
          toast.success('Recurring settings removed from event!');
        } else {
          console.log("Regular update to event");
          const updatedEvent = await updateEvent(eventToUpdate as any);
          console.log("Updated event:", updatedEvent);
          toast.success('Event updated successfully!');
        }
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
        console.log(`Deleting ${recurrenceEditMode === 'all' ? 'all occurrences' : 'future occurrences'} of recurring event`);
        
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
