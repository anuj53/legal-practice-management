
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';
import { CalendarEvent as Event, RecurrencePattern } from '@/types/calendar';

/**
 * Generate recurring event instances within a date range
 */
export const generateRecurringInstances = (
  baseEvent: Event,
  pattern: RecurrencePattern,
  startDate: Date,
  endDate: Date
): Event[] => {
  console.log("Generating recurring instances for:", baseEvent.title);
  console.log("Pattern:", pattern);
  console.log("Date range:", startDate, "to", endDate);
  
  const instances: Event[] = []; // Don't include original event
  let currentDate = new Date(baseEvent.start);
  const duration = baseEvent.end.getTime() - baseEvent.start.getTime();
  
  // Set a reasonable limit to prevent infinite loops
  const MAX_INSTANCES = 100;
  
  // If pattern has an end date, respect it
  const patternEndDate = pattern.endsOn ? new Date(pattern.endsOn) : null;
  
  // Track how many instances we've added
  let instanceCount = 0;
  
  // Generate next occurrence date
  const getNextDate = (date: Date): Date => {
    switch (pattern.frequency) {
      case 'daily':
        return addDays(date, pattern.interval || 1);
      case 'weekly':
        return addWeeks(date, pattern.interval || 1);
      case 'monthly':
        return addMonths(date, pattern.interval || 1);
      case 'yearly':
        return addYears(date, pattern.interval || 1);
      default:
        return addDays(date, 1);
    }
  };
  
  // Get the next date after the current one
  currentDate = getNextDate(currentDate);
  
  // While we're within our search range and haven't hit pattern limits
  while (
    isBefore(currentDate, endDate) && 
    instanceCount < MAX_INSTANCES &&
    (!patternEndDate || isBefore(currentDate, patternEndDate)) &&
    (!pattern.endsAfter || instanceCount < pattern.endsAfter)
  ) {
    // Only include dates after the search start date
    if (!isBefore(currentDate, startDate)) {
      const startTime = new Date(currentDate);
      const endTime = new Date(currentDate.getTime() + duration);
      
      const instance: Event = {
        ...baseEvent,
        id: `${baseEvent.id}_${instanceCount}`, // Generate a unique ID
        start: startTime,
        end: endTime,
        isRecurring: true, // Mark as a recurring instance
        seriesId: baseEvent.id, // Remember the parent event
      };
      
      instances.push(instance);
    }
    
    // Move to next occurrence and increment counter
    currentDate = getNextDate(currentDate);
    instanceCount++;
  }
  
  console.log(`Generated ${instances.length} instances for event ${baseEvent.title}`);
  return instances;
};
