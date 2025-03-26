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
  }, [events, myCalendars, otherCalendars]);
  
  const filteredEvents = events.filter(event => {
    console.log("Filtering event:", event.id, event.title, "for calendar:", event.calendar);
    
    if (!event.calendar) {
      console.log("Event has no calendar ID:", event.title);
      return false;
    }
    
    const allCalendars = [...myCalendars, ...otherCalendars];
    const calendar = allCalendars.find(cal => cal.id === event.calendar);
    
    if (!calendar) {
      console.log("Calendar not found for event:", event.title, "Calendar ID:", event.calendar);
      return false;
    }
    
    console.log("Event will be displayed:", event.title, "Calendar checked:", calendar.checked);
    return calendar.checked;
  });
  
  useEffect(() => {
    console.log("Filtered events:", filteredEvents.length);
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
    const now = new Date();
    const defaultEvent = {
      id: '',  // Empty ID for new events
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
      type: 'client-meeting' as const,
      calendar: myCalendars.length > 0 ? myCalendars[0].id : 'personal',
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
      toast.error('Failed to save event');
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
      toast.error('Failed to delete event');
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
    handleDeleteEvent
  };
}
