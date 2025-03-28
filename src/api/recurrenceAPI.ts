
import { supabase } from '@/integrations/supabase/client';
import { RecurrencePattern } from '@/types/calendar';
import { toast } from 'sonner';

// Create a new recurrence rule in the database
export const createRecurrenceRule = async (pattern: RecurrencePattern): Promise<string | null> => {
  try {
    // Since the table may not exist in the database yet, we'll use a more direct approach
    const { data, error } = await supabase
      .rpc('create_recurrence_rule', {
        frequency: pattern.frequency,
        interval_val: pattern.interval || 1,
        week_days_val: pattern.weekDays || null,
        month_days_val: pattern.monthDays || null,
        ends_on_val: pattern.endsOn ? pattern.endsOn.toISOString() : null,
        ends_after_val: pattern.endsAfter || null
      });
      
    if (error) {
      console.error('Error creating recurrence rule:', error);
      // Fall back to updating the event directly with the pattern JSON
      return null;
    }
    
    return data || null;
  } catch (err) {
    console.error('Error in createRecurrenceRule:', err);
    return null;
  }
};

// Update a recurrence rule in the database
export const updateRecurrenceRule = async (id: string, pattern: RecurrencePattern): Promise<boolean> => {
  try {
    // Since the table may not exist in the database yet, we'll use a more direct approach
    const { error } = await supabase
      .rpc('update_recurrence_rule', {
        rule_id: id,
        frequency: pattern.frequency,
        interval_val: pattern.interval || 1,
        week_days_val: pattern.weekDays || null,
        month_days_val: pattern.monthDays || null,
        ends_on_val: pattern.endsOn ? pattern.endsOn.toISOString() : null,
        ends_after_val: pattern.endsAfter || null
      });
      
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
    // Since the table may not exist in the database yet, we'll use a more direct approach
    const { error } = await supabase
      .rpc('delete_recurrence_rule', {
        rule_id: id
      });
      
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
    // Instead of creating a separate recurrence rule, we'll just update the event directly
    // with the recurrence pattern as JSON
    
    // Update the event with the recurrence pattern
    const { data, error } = await supabase
      .from('events')
      .update({
        is_recurring: true,
        recurrence_pattern: pattern as any
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
    // Update the event to remove recurrence
    const { data, error } = await supabase
      .from('events')
      .update({
        is_recurring: false,
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
      recurrencePattern: undefined
    };
  } catch (err) {
    console.error('Error in makeEventNonRecurring:', err);
    return null;
  }
};
