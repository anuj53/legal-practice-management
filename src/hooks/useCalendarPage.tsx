
import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar.tsx';
import { useEventManagement } from '@/hooks/useEventManagement';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';
import { generateRecurringInstances } from '@/utils/recurrenceUtils';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  const [displayedEvents, setDisplayedEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  const {
    myCalendars,
    otherCalendars,
    events: rawEvents,
    loading: apiLoading,
    dataUpdated = 0
  } = useCalendar();
  
  // Listen for custom event to force refresh
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log("Detected calendar data update event, forcing refresh");
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('calendar-data-update', handleDataUpdate);
    
    return () => {
      window.removeEventListener('calendar-data-update', handleDataUpdate);
    };
  }, []);
  
  useEffect(() => {
    if (!apiLoading) {
      setIsLoading(false);
      console.log("API loading completed, raw events count:", rawEvents.length);
    }
  }, [rawEvents, apiLoading, dataUpdated, forceUpdate]);
  
  const {
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
  } = useEventManagement();
  
  const {
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  } = useCalendarManagement();
  
  const events = rawEvents.map(event => {
    const calendar = [...myCalendars, ...otherCalendars].find(cal => cal.id === event.calendar);
    return {
      ...event,
      calendarColor: calendar?.color || '#9CA3AF',
      type: event.type || 'client-meeting'
    } as CalendarEvent;
  });

  console.log("Raw events in useCalendarPage:", rawEvents);
  console.log("Processed events with calendar colors:", events);
  
  useEffect(() => {
    let viewStart: Date;
    let viewEnd: Date;
    
    switch (currentView) {
      case 'day':
        viewStart = new Date(currentDate);
        viewStart.setHours(0, 0, 0, 0);
        viewEnd = new Date(currentDate);
        viewEnd.setHours(23, 59, 59, 999);
        break;
      case 'week':
        viewStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        viewEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'month':
        viewStart = startOfMonth(currentDate);
        viewEnd = endOfMonth(currentDate);
        break;
      case 'agenda':
        viewStart = new Date(currentDate);
        viewStart.setHours(0, 0, 0, 0);
        viewEnd = addDays(currentDate, 30);
        viewEnd.setHours(23, 59, 59, 999);
        break;
      default:
        viewStart = new Date(currentDate);
        viewStart.setHours(0, 0, 0, 0);
        viewEnd = new Date(currentDate);
        viewEnd.setHours(23, 59, 59, 999);
    }

    const processedEvents = [...events];
    
    // Generate recurring instances if needed
    if (events.length > 0) {
      events.forEach(event => {
        if (event.isRecurring && event.recurrencePattern) {
          try {
            const instances = generateRecurringInstances(
              event,
              event.recurrencePattern,
              viewStart,
              viewEnd
            );
            
            if (instances.length > 0) {
              console.log(`Adding ${instances.length} recurring instances for event ${event.title}`);
              processedEvents.push(...instances);
            }
          } catch (error) {
            console.error("Error generating recurring instances for event:", event.id, error);
          }
        }
      });
    } else {
      console.log("No events to process for recurrence");
    }
    
    console.log("Total displayed events being set:", processedEvents.length);
    setDisplayedEvents(processedEvents);
  }, [events, currentDate, currentView, forceUpdate]);
  
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    
    if (currentView === 'month') {
      setCurrentView('day');
    } else {
      handleCreateEventAtTime(date);
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
    recurrenceEditMode,
    setRecurrenceEditMode,
    myCalendars,
    otherCalendars,
    events: displayedEvents,
    loading: isLoading,
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
