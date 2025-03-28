
import { useCalendar } from '@/hooks/useCalendar';
import { Calendar } from '@/types/calendar';
import { toast } from 'sonner';

export function useCalendarManagement() {
  const {
    toggleCalendar,
    createCalendar,
    updateCalendar,
    deleteCalendar,
  } = useCalendar();
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    toggleCalendar(id);
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
  
  return {
    handleCalendarToggle,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  };
}
