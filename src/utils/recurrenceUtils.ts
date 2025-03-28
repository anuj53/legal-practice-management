
import { addDays, addMonths, addYears, isSameDay, startOfDay, isBefore, endOfDay, getDay } from 'date-fns';
import { Event } from './calendarTypes';

/**
 * Generates recurring event instances based on a parent event with recurrence pattern
 */
export const generateRecurringEvents = (
  parentEvent: Event,
  viewStart: Date,
  viewEnd: Date
): Event[] => {
  if (!parentEvent.recurrencePattern) {
    console.log('No recurrence pattern found for event', parentEvent.id);
    return [];
  }

  const { frequency, interval, endDate, occurrences, weekdays } = parentEvent.recurrencePattern;
  const startDate = new Date(parentEvent.start);
  const recurringEvents: Event[] = [];
  
  // For debugging
  console.log('Generating recurring events with pattern:', {
    frequency,
    interval,
    endDate: endDate ? new Date(endDate) : 'none',
    occurrences,
    weekdays,
    viewStart: new Date(viewStart),
    viewEnd: new Date(viewEnd)
  });

  // Normalized view boundaries (start of day and end of day)
  const viewStartDay = startOfDay(viewStart);
  const viewEndDay = endOfDay(viewEnd);
  
  // Track occurrences count if specified
  let currentOccurrenceCount = 0;
  const maxOccurrences = occurrences || Infinity;
  
  // Track date for iterations
  let currentDate = new Date(startDate);
  
  // Maximum safety iterations to prevent infinite loops
  const MAX_ITERATIONS = 1000;
  let iterations = 0;
  
  while (iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Check if we've reached occurrence limit
    if (currentOccurrenceCount >= maxOccurrences) {
      console.log(`Stopped at ${currentOccurrenceCount} occurrences (limit: ${maxOccurrences})`);
      break;
    }
    
    // Check if we've gone past the end date
    if (endDate && isBefore(endDate, currentDate)) {
      console.log('Stopped at end date:', endDate);
      break;
    }
    
    // Skip the first iteration as it's the parent event itself
    if (iterations > 1) {
      // For weekly recurrence, check if current day is in weekdays array
      if (frequency === 'weekly' && weekdays && weekdays.length > 0) {
        const dayOfWeek = getDay(currentDate); // 0-6, where 0 is Sunday
        if (!weekdays.includes(dayOfWeek)) {
          // Advance by one day and continue to next iteration
          currentDate = addDays(currentDate, 1);
          continue;
        }
      }
      
      // Check if current date falls within view range
      if (isBefore(currentDate, viewStartDay) || isBefore(viewEndDay, currentDate)) {
        // Advance date based on frequency and interval
        currentDate = advanceDate(currentDate, frequency, interval);
        continue;
      }
      
      // Generate a new recurring instance
      const durationMs = new Date(parentEvent.end).getTime() - new Date(parentEvent.start).getTime();
      const newEndDate = new Date(currentDate.getTime() + durationMs);
      
      // Create recurring event instance
      const recurringEvent: Event = {
        ...parentEvent,
        id: `${parentEvent.id}_recurrence_${iterations}`,
        start: new Date(currentDate),
        end: newEndDate,
        isRecurringInstance: true,
        parentEventId: parentEvent.id
      };
      
      console.log(`Generated recurrence #${currentOccurrenceCount + 1} on ${currentDate}`);
      recurringEvents.push(recurringEvent);
      currentOccurrenceCount++;
    }
    
    // Advance date based on frequency and interval
    if (frequency === 'daily') {
      currentDate = addDays(currentDate, interval);
    } else if (frequency === 'weekly') {
      // For weekly pattern with specific weekdays
      if (weekdays && weekdays.length > 0) {
        currentDate = addDays(currentDate, 1);
      } else {
        // Without weekdays, just advance by the weekly interval
        currentDate = addDays(currentDate, interval * 7);
      }
    } else if (frequency === 'monthly') {
      currentDate = addMonths(currentDate, interval);
    } else if (frequency === 'yearly') {
      currentDate = addYears(currentDate, interval);
    } else {
      console.error('Unsupported recurrence frequency:', frequency);
      break;
    }
  }
  
  if (iterations >= MAX_ITERATIONS) {
    console.warn('Reached maximum iterations for recurring events');
  }
  
  console.log(`Generated ${recurringEvents.length} recurring events`);
  return recurringEvents;
};

// Helper function to advance date based on frequency and interval
const advanceDate = (date: Date, frequency: string, interval: number): Date => {
  switch (frequency) {
    case 'daily':
      return addDays(date, interval);
    case 'weekly':
      return addDays(date, interval * 7);
    case 'monthly':
      return addMonths(date, interval);
    case 'yearly':
      return addYears(date, interval);
    default:
      console.error('Invalid frequency:', frequency);
      return addDays(date, interval);
  }
};
