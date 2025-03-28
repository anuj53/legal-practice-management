
import { useState, useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarManagement } from '@/hooks/useCalendarManagement';
import { toast } from 'sonner';

export const useCalendarPage = () => {
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView
  } = useCalendarView();

  const {
    events,
    selectedEvent,
    modalOpen,
    modalMode,
    setModalOpen,
    handleEventClick,
    handleDayClick,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent
  } = useCalendarEvents();

  const {
    myCalendars,
    otherCalendars,
    loading: calendarLoading,
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar
  } = useCalendarManagement();

  const [loading, setLoading] = useState<boolean>(true);

  // Initialize/fetch data
  useEffect(() => {
    // This is now managed by the individual hooks
    // Just need to determine when everything is loaded
    setLoading(false);
  }, []);

  return {
    // Calendar view state
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,

    // Calendar data
    myCalendars,
    otherCalendars,
    events,
    loading,

    // Event modal state
    selectedEvent,
    modalOpen,
    setModalOpen,
    modalMode,

    // Calendar actions
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,

    // Event actions
    handleEventClick,
    handleDayClick,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
  };
};
