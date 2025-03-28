
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';
import { Event, RecurrencePattern } from './calendarTypes';

// Generate recurring event instances based on a pattern
export const generateRecurringInstances = (
  baseEvent: Event, 
  pattern: RecurrencePattern, 
  startDate: Date, 
  endDate: Date
): Event[] => {
  if (!pattern || !pattern.frequency) {
    return [baseEvent]; // Return the base event if no valid pattern
  }
  
  const instances: Event[] = [];
  let currentDate = new Date(baseEvent.start);
  let occurrenceCount = 0;
  
  // Determine the end condition
  const hasEndDate = !!pattern.endsOn;
  const hasMaxOccurrences = !!pattern.endsAfter;
  
  // Loop until we hit the end condition
  while (
    (hasEndDate ? isBefore(currentDate, pattern.endsOn!) : true) &&
    (hasMaxOccurrences ? occurrenceCount < pattern.endsAfter! : true) &&
    isBefore(currentDate, endDate)
  ) {
    // Skip the first occurrence if it's before our requested start date
    if (isBefore(currentDate, startDate)) {
      // Move to next occurrence based on frequency
      currentDate = getNextOccurrence(currentDate, pattern);
      occurrenceCount++;
      continue;
    }
    
    // Calculate event duration in milliseconds
    const duration = baseEvent.end.getTime() - baseEvent.start.getTime();
    
    // Create a new event instance
    const eventInstance: Event = {
      ...baseEvent,
      id: `${baseEvent.id}_${occurrenceCount}`, // Create a unique ID for this instance
      start: new Date(currentDate),
      end: new Date(currentDate.getTime() + duration),
      isRecurring: true,
      seriesId: baseEvent.id, // Reference to the original event
    };
    
    instances.push(eventInstance);
    
    // Move to next occurrence based on frequency
    currentDate = getNextOccurrence(currentDate, pattern);
    occurrenceCount++;
  }
  
  return instances;
};

// Get the next occurrence date based on recurrence pattern
const getNextOccurrence = (currentDate: Date, pattern: RecurrencePattern): Date => {
  const interval = pattern.interval || 1;
  
  switch (pattern.frequency) {
    case 'daily':
      return addDays(currentDate, interval);
      
    case 'weekly':
      return addWeeks(currentDate, interval);
      
    case 'monthly':
      return addMonths(currentDate, interval);
      
    case 'yearly':
      return addYears(currentDate, interval);
      
    default:
      return addDays(currentDate, 1); // Fallback to daily if unknown frequency
  }
};

// Check if a date matches a specific recurrence pattern
export const matchesRecurrencePattern = (date: Date, baseDate: Date, pattern: RecurrencePattern): boolean => {
  // Implementation would need to check if the date is part of the recurrence
  // This is a simplified version - a complete implementation would check weekDays, monthDays, etc.
  
  const interval = pattern.interval || 1;
  
  switch (pattern.frequency) {
    case 'daily':
      // Check if days apart is a multiple of interval
      const dayDiff = Math.round((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff % interval === 0;
      
    case 'weekly':
      // Check if weeks apart is a multiple of interval
      const weekDiff = Math.round((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weekDiff % interval !== 0) return false;
      
      // Also check day of week if weekDays is specified
      if (pattern.weekDays && pattern.weekDays.length > 0) {
        const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getDay()];
        return pattern.weekDays.includes(dayOfWeek);
      }
      return true;
      
    case 'monthly':
      // Check if months apart is a multiple of interval
      const monthDiff = (date.getFullYear() - baseDate.getFullYear()) * 12 + 
                         (date.getMonth() - baseDate.getMonth());
      if (monthDiff % interval !== 0) return false;
      
      // Also check day of month if monthDays is specified
      if (pattern.monthDays && pattern.monthDays.length > 0) {
        return pattern.monthDays.includes(date.getDate());
      }
      return true;
      
    case 'yearly':
      // Check if years apart is a multiple of interval
      const yearDiff = date.getFullYear() - baseDate.getFullYear();
      return yearDiff % interval === 0 && 
             date.getMonth() === baseDate.getMonth() && 
             date.getDate() === baseDate.getDate();
      
    default:
      return false;
  }
};
