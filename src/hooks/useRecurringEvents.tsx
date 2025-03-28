
import { useState } from 'react';
import { RecurrencePattern } from '@/types/calendar';
import { toast } from 'sonner';
import {
  createRecurrenceRule,
  updateRecurrenceRule,
  deleteRecurrenceRule,
  makeEventRecurring,
  makeEventNonRecurring
} from '@/api/recurrenceAPI';

export function useRecurringEvents() {
  const [loading, setLoading] = useState(false);
  
  // Wrapper for creating a recurrence rule
  const handleCreateRecurrenceRule = async (pattern: RecurrencePattern): Promise<string | null> => {
    try {
      setLoading(true);
      const result = await createRecurrenceRule(pattern);
      
      if (!result) {
        toast.error('Could not create recurrence pattern: The necessary database structure is not available');
        return null;
      }
      
      return result;
    } catch (err) {
      toast.error(`Unexpected error creating recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Wrapper for updating a recurrence rule
  const handleUpdateRecurrenceRule = async (id: string, pattern: RecurrencePattern): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await updateRecurrenceRule(id, pattern);
      
      if (!result) {
        toast.error('Could not update recurrence pattern: The necessary database structure is not available');
        return false;
      }
      
      return true;
    } catch (err) {
      toast.error(`Unexpected error updating recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Wrapper for deleting a recurrence rule
  const handleDeleteRecurrenceRule = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await deleteRecurrenceRule(id);
      
      if (!result) {
        toast.error('Could not delete recurrence pattern: The necessary database structure is not available');
        return false;
      }
      
      return true;
    } catch (err) {
      toast.error(`Unexpected error deleting recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Wrapper for making an event recurring
  const handleMakeEventRecurring = async (event: any, pattern: RecurrencePattern): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await makeEventRecurring(event, pattern);
      
      if (!result) {
        toast.error('Failed to make event recurring');
        return null;
      }
      
      return result;
    } catch (err) {
      toast.error(`Unexpected error making event recurring: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Wrapper for making an event non-recurring
  const handleMakeEventNonRecurring = async (event: any): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await makeEventNonRecurring(event);
      
      if (!result) {
        toast.error('Failed to remove recurring settings');
        return null;
      }
      
      return result;
    } catch (err) {
      toast.error(`Unexpected error removing recurring settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createRecurrenceRule: handleCreateRecurrenceRule,
    updateRecurrenceRule: handleUpdateRecurrenceRule,
    deleteRecurrenceRule: handleDeleteRecurrenceRule,
    makeEventRecurring: handleMakeEventRecurring,
    makeEventNonRecurring: handleMakeEventNonRecurring,
    loading
  };
}
