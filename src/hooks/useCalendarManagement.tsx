
import { useState } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { Calendar } from '@/utils/calendarUtils';
import { toast } from 'sonner';

export const useCalendarManagement = () => {
  const {
    myCalendars,
    otherCalendars,
    toggleCalendar,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    setMyCalendars,
    setOtherCalendars,
  } = useCalendar();
  
  const [loading, setLoading] = useState(false);

  // Handle calendar toggle
  const handleCalendarToggle = (calendarId: string) => {
    toggleCalendar(calendarId);
  };

  // Handle creating a new calendar
  const handleCreateCalendar = async (calendar: Omit<Calendar, 'id'>) => {
    try {
      setLoading(true);
      await createCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" created successfully!`);
    } catch (err) {
      console.error('Error creating calendar:', err);
      toast.error('Failed to create calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a calendar
  const handleUpdateCalendar = async (calendar: Calendar) => {
    try {
      setLoading(true);
      await updateCalendar(calendar);
      toast.success(`Calendar "${calendar.name}" updated successfully!`);
    } catch (err) {
      console.error('Error updating calendar:', err);
      toast.error('Failed to update calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a calendar
  const handleDeleteCalendar = async (calendarId: string) => {
    try {
      setLoading(true);
      await deleteCalendar(calendarId);
      toast.success('Calendar deleted successfully!');
    } catch (err) {
      console.error('Error deleting calendar:', err);
      toast.error('Failed to delete calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    myCalendars,
    otherCalendars,
    loading,
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  };
};
