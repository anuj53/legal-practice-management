
import { useState } from 'react';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';
import { useEventManagement } from '@/hooks/useEventManagement';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';

export function useCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');

  const {
    myCalendars,
    otherCalendars,
    events: rawEvents,
  } = useCalendar();
  
  const {
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
  } = useEventManagement();
  
  const {
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  } = useCalendarManagement();
  
  // Enhanced events with calendar color information
  const events = rawEvents.map(event => {
    const calendar = [...myCalendars, ...otherCalendars].find(cal => cal.id === event.calendar);
    return {
      ...event,
      calendarColor: calendar?.color || '#9CA3AF' // Default gray color if calendar not found
    };
  });
  
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
