
import { addDays, addMonths, addYears, getDay } from 'date-fns';
import { Event } from './types';

// Generate recurring event instances in a given date range
export function generateRecurringEventInstances(
  event: Event,
  rangeStart: Date,
  rangeEnd: Date
): Event[] {
  if (!event.isRecurring || !event.recurrencePattern) {
    return [];
  }

  console.log(`Generating instances for recurring event: ${event.title}`);
  const instances: Event[] = [];
  const { frequency, interval, endDate, weekdays, monthDay, occurrences } = event.recurrencePattern;
  
  // Calculate event duration in milliseconds
  const durationMs = new Date(event.end).getTime() - new Date(event.start).getTime();
  
  // Start from the original event start date
  let currentDate = new Date(event.start);
  let instanceCount = 0;
  
  // Function to add a new event instance
  const addInstance = (date: Date) => {
    const newStart = new Date(date);
    const newEnd = new Date(newStart.getTime() + durationMs);
    
    // Only add if the instance falls within our display range
    if (
      (newStart >= rangeStart && newStart < rangeEnd) ||
      (newEnd > rangeStart && newEnd <= rangeEnd) ||
      (newStart <= rangeStart && newEnd >= rangeEnd)
    ) {
      instances.push({
        ...event,
        start: newStart,
        end: newEnd,
        isRecurringInstance: true // Mark as an instance of a recurring event
      });
    }
    
    return newStart;
  };
  
  // For the first instance, include it if it falls within our range
  if (currentDate >= rangeStart && currentDate < rangeEnd) {
    addInstance(currentDate);
    instanceCount++;
  }

  // Generate additional instances
  while (true) {
    // Stop if we've reached the specified number of occurrences
    if (occurrences && instanceCount >= occurrences) {
      break;
    }
    
    // Apply the recurrence pattern to get the next occurrence
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
        
      case 'weekly':
        if (weekdays && weekdays.length > 0) {
          // For weekly recurrence with specific weekdays
          currentDate = addDays(currentDate, 1);
          
          // Find the next matching weekday
          while (!weekdays.includes(getDay(currentDate))) {
            currentDate = addDays(currentDate, 1);
          }
        } else {
          // Simple weekly recurrence
          currentDate = addDays(currentDate, 7 * interval);
        }
        break;
        
      case 'monthly':
        if (monthDay && monthDay > 0) {
          // For monthly recurrence on a specific day of month
          currentDate = addMonths(currentDate, interval);
          // Set to the specified day of month
          currentDate.setDate(monthDay);
        } else {
          // Simple monthly recurrence (same day of month)
          currentDate = addMonths(currentDate, interval);
        }
        break;
        
      case 'yearly':
        currentDate = addYears(currentDate, interval);
        break;
        
      default:
        return instances; // Unknown frequency
    }
    
    // Stop if we've reached the endDate (if specified)
    if (endDate && currentDate > endDate) {
      break;
    }
    
    // Stop if we're beyond our display range
    if (currentDate > rangeEnd) {
      break;
    }
    
    // Add this instance if it's within our range and increment the counter
    if (currentDate >= rangeStart) {
      addInstance(currentDate);
      instanceCount++; // Increment counter after successfully adding an instance
    }
  }
  
  console.log(`Generated ${instances.length} instances for event "${event.title}"`);
  return instances;
}
