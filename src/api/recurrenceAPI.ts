
import { supabase } from '@/integrations/supabase/client';
import { RecurrencePattern } from '@/types/calendar';
import { toast } from 'sonner';

// Create a new recurrence rule in the database
export const createRecurrenceRule = async (pattern: RecurrencePattern): Promise<string | null> => {
  try {
    // Check if recurrence_rules table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('recurrence_rules')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('recurrence_rules table may not exist:', checkError);
      return null;
    }
    
    // Insert the new recurrence rule
    const { data, error } = await supabase
      .from('recurrence_rules')
      .insert({
        frequency: pattern.frequency,
        interval: pattern.interval || 1,
        week_days: pattern.weekDays || null,
        month_days: pattern.monthDays || null,
        ends_on: pattern.endsOn ? pattern.endsOn.toISOString() : null,
        ends_after: pattern.endsAfter || null
      })
      .select();
      
    if (error) {
      console.error('Error creating recurrence rule:', error);
      return null;
    }
    
    return data?.[0]?.id || null;
  } catch (err) {
    console.error('Error in createRecurrenceRule:', err);
    return null;
  }
};

// Update a recurrence rule in the database
export const updateRecurrenceRule = async (id: string, pattern: RecurrencePattern): Promise<boolean> => {
  try {
    // Check if recurrence_rules table exists
    const { error: checkError } = await supabase
      .from('recurrence_rules')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('recurrence_rules table may not exist:', checkError);
      return false;
    }
    
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
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateRecurrenceRule:', err);
    return false;
  }
};

// Delete a recurrence rule from the database
export const deleteRecurrenceRule = async (id: string): Promise<boolean> => {
  try {
    // Check if recurrence_rules table exists
    const { error: checkError } = await supabase
      .from('recurrence_rules')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('recurrence_rules table may not exist:', checkError);
      return false;
    }
    
    const { error } = await supabase
      .from('recurrence_rules')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting recurrence rule:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteRecurrenceRule:', err);
    return false;
  }
};

// Update event with recurring options - returns updated event if successful
export const makeEventRecurring = async (event: any, pattern: RecurrencePattern): Promise<any | null> => {
  try {
    // First create the recurrence rule
    const recurrenceId = await createRecurrenceRule(pattern);
    
    if (!recurrenceId) {
      throw new Error('Failed to create recurrence rule');
    }
    
    // Update the event with the recurrence ID and pattern
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
      return null;
    }
    
    // Return the updated event
    return {
      ...event,
      isRecurring: true,
      recurrenceId,
      recurrencePattern: pattern
    };
  } catch (err) {
    console.error('Error in makeEventRecurring:', err);
    return null;
  }
};

// Remove recurring properties from an event
export const makeEventNonRecurring = async (event: any): Promise<any | null> => {
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
      return null;
    }
    
    // Return the updated event
    return {
      ...event,
      isRecurring: false,
      recurrenceId: undefined,
      recurrencePattern: undefined
    };
  } catch (err) {
    console.error('Error in makeEventNonRecurring:', err);
    return null;
  }
};
