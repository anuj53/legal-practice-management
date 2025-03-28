
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, RecurrencePattern } from '@/utils/calendarTypes';
import { toast } from 'sonner';
import { createRecurrenceRule } from '@/utils/dataConversionUtils';

export function useRecurringEvents() {
  const [loading, setLoading] = useState(false);
  
  // Create a new recurrence rule in the database
  const createRecurrenceRule = async (pattern: RecurrencePattern): Promise<string | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recurrence_rules')
        .insert([{
          frequency: pattern.frequency,
          interval: pattern.interval || 1,
          week_days: pattern.weekDays || null,
          month_days: pattern.monthDays || null,
          ends_on: pattern.endsOn ? pattern.endsOn.toISOString() : null,
          ends_after: pattern.endsAfter || null
        }])
        .select();
        
      if (error) {
        console.error('Error creating recurrence rule:', error);
        toast.error(`Failed to create recurrence pattern: ${error.message}`);
        return null;
      }
      
      return data?.[0]?.id || null;
    } catch (err) {
      console.error('Error in createRecurrenceRule:', err);
      toast.error(`Unexpected error creating recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Update a recurrence rule in the database
  const updateRecurrenceRule = async (id: string, pattern: RecurrencePattern): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('recurrence_rules')
        .update({
          frequency: pattern.frequency,
          interval: pattern.interval || 1,
          week_days: pattern.weekDays || null,
          month_days: pattern.monthDays || null,
          ends_on: pattern.endsOn ? pattern.endsOn.toISOString() : null,
          ends_after: pattern.endsAfter || null
        })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating recurrence rule:', error);
        toast.error(`Failed to update recurrence pattern: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in updateRecurrenceRule:', err);
      toast.error(`Unexpected error updating recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a recurrence rule from the database
  const deleteRecurrenceRule = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('recurrence_rules')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting recurrence rule:', error);
        toast.error(`Failed to delete recurrence pattern: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in deleteRecurrenceRule:', err);
      toast.error(`Unexpected error deleting recurrence pattern: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update event with recurring options
  const makeEventRecurring = async (event: Event, pattern: RecurrencePattern): Promise<Event | null> => {
    try {
      // First create the recurrence rule
      const recurrenceId = await createRecurrenceRule(pattern);
      
      if (!recurrenceId) {
        throw new Error('Failed to create recurrence rule');
      }
      
      // Update the event with the recurrence ID
      const { data, error } = await supabase
        .from('events')
        .update({
          is_recurring: true,
          recurrence_id: recurrenceId,
          recurrence_pattern: pattern
        })
        .eq('id', event.id)
        .select();
        
      if (error) {
        console.error('Error updating event with recurrence:', error);
        toast.error(`Failed to make event recurring: ${error.message}`);
        return null;
      }
      
      return {
        ...event,
        isRecurring: true,
        recurrenceId,
        recurrencePattern: pattern
      };
    } catch (err) {
      console.error('Error in makeEventRecurring:', err);
      toast.error(`Unexpected error making event recurring: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };
  
  // Remove recurring properties from an event
  const makeEventNonRecurring = async (event: Event): Promise<Event | null> => {
    try {
      // Delete the recurrence rule if it exists
      if (event.recurrenceId) {
        await deleteRecurrenceRule(event.recurrenceId);
      }
      
      // Update the event to remove recurrence
      const { data, error } = await supabase
        .from('events')
        .update({
          is_recurring: false,
          recurrence_id: null,
          recurrence_pattern: null
        })
        .eq('id', event.id)
        .select();
        
      if (error) {
        console.error('Error removing recurrence from event:', error);
        toast.error(`Failed to remove recurring settings: ${error.message}`);
        return null;
      }
      
      return {
        ...event,
        isRecurring: false,
        recurrenceId: undefined,
        recurrencePattern: undefined
      };
    } catch (err) {
      console.error('Error in makeEventNonRecurring:', err);
      toast.error(`Unexpected error removing recurring settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };
  
  return {
    createRecurrenceRule,
    updateRecurrenceRule,
    deleteRecurrenceRule,
    makeEventRecurring,
    makeEventNonRecurring,
    loading
  };
}
