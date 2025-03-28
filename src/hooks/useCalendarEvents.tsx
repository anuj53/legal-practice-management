
import { useState } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { toast } from 'sonner';
import { CalendarEvent } from '@/types/calendar'; 
import { Event } from '@/utils/calendarUtils'; 

export const useCalendarEvents = () => {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    setEvents,
    dataUpdated,
  } = useCalendar();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Handle event click
  const handleEventClick = (event: Event | CalendarEvent) => {
    setSelectedEvent(event as Event);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Handle create event
  const handleCreateEvent = (date?: Date) => {
    const now = date || new Date();
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);
    
    setSelectedEvent({
      id: '',
      title: '',
      start: now,
      end: oneHourLater,
      type: 'client-meeting',
      calendar: '',
    });
    setModalMode('create');
    setModalOpen(true);
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    handleCreateEvent(date);
  };

  // Handle saving an event (create or update)
  const handleSaveEvent = async (event: Event) => {
    try {
      if (modalMode === 'create') {
        await createEvent(event);
        toast.success('Event created successfully!');
      } else {
        await updateEvent(event);
        toast.success('Event updated successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error('Failed to save event');
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully!');
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };
  
  return {
    events,
    selectedEvent,
    modalOpen,
    modalMode,
    setModalOpen,
    handleEventClick,
    handleDayClick,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
  };
};
