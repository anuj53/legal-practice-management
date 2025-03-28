
import { addHours, addDays, subDays, startOfDay, addWeeks, addMonths, addYears, isBefore, isSameDay, getDay } from 'date-fns';

// Types
export interface Calendar {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  user_id?: string;
  is_firm?: boolean;
  is_statute?: boolean;
  is_public?: boolean;
}

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
  description?: string;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  isRecurringInstance?: boolean; // Add this property for recurring event instances
  reminder?: string;
  // Legal-specific fields
  caseId?: string;
  clientName?: string;
  assignedLawyer?: string;
  courtInfo?: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  documents?: Array<{id: string, name: string, url: string}>;
  // Recurrence options
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    weekdays?: number[]; // 0-6 for Sunday-Saturday
    monthDay?: number;
    occurrences?: number;
  };
  isAllDay?: boolean;
}

// Helper function to validate UUID format
export const isValidUUID = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    console.log(`UUID validation failed: ${id} is not a valid string`);
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(id);
  console.log(`UUID validation for "${id}": ${isValid}`);
  return isValid;
};

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
  console.log(`Event recurrence pattern:`, event.recurrencePattern);
  console.log(`Date range: ${rangeStart.toISOString()} to ${rangeEnd.toISOString()}`);
  
  const instances: Event[] = [];
  const { frequency, interval, endDate, weekdays, monthDay, occurrences } = event.recurrencePattern;
  
  // Calculate event duration in milliseconds
  const durationMs = new Date(event.end).getTime() - new Date(event.start).getTime();
  
  // Start from the original event start date
  let currentDate = new Date(event.start);
  let instanceCount = 0;
  
  // Set to track dates we've already added to prevent duplicates
  const addedDates = new Set<string>();
  
  // Function to add a new event instance
  const addInstance = (date: Date) => {
    const newStart = new Date(date);
    const newEnd = new Date(newStart.getTime() + durationMs);
    
    // Format date to string to use as key in our Set
    const dateKey = newStart.toISOString();
    
    // Skip if we've already added this date (prevent duplicates)
    if (addedDates.has(dateKey)) {
      console.log(`Skipping duplicate date: ${dateKey}`);
      return newStart;
    }
    
    // Only add if the instance falls within our display range
    if (
      (newStart >= rangeStart && newStart < rangeEnd) ||
      (newEnd > rangeStart && newEnd <= rangeEnd) ||
      (newStart <= rangeStart && newEnd >= rangeEnd)
    ) {
      // Mark this date as added
      addedDates.add(dateKey);
      
      instances.push({
        ...event,
        id: `${event.id}-instance-${instanceCount}`, // Ensure unique ID for each instance
        start: newStart,
        end: newEnd,
        isRecurringInstance: true // Mark as an instance of a recurring event
      });
      
      instanceCount++;
      console.log(`Added instance ${instanceCount} at ${newStart.toISOString()}`);
    }
    
    return newStart;
  };
  
  // For the first instance, include it only if it falls within our range and only if it's not already passed
  if (currentDate >= rangeStart && currentDate < rangeEnd) {
    addInstance(currentDate);
  }

  // Generate additional instances
  while (true) {
    // Stop if we've reached the specified number of occurrences
    if (occurrences && instanceCount >= occurrences) {
      console.log(`Stopping: reached ${occurrences} occurrences`);
      break;
    }
    
    // Apply the recurrence pattern to get the next occurrence
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
        
      case 'weekly':
        if (weekdays && weekdays.length > 0) {
          // Completely rewritten weekly recurrence logic to fix multiple issues
          console.log("Processing weekly recurrence with specific weekdays:", weekdays);
          
          const currentDayOfWeek = getDay(currentDate); // 0-6 for Sunday-Saturday
          console.log(`Current date: ${currentDate.toISOString()}, day of week: ${currentDayOfWeek}`);
          
          // Sort weekdays to ensure correct order
          const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
          
          // Find the next day in the current week
          let foundNextDay = false;
          let nextDayOfWeek = -1;
          
          for (const weekday of sortedWeekdays) {
            if (weekday > currentDayOfWeek) {
              nextDayOfWeek = weekday;
              foundNextDay = true;
              break;
            }
          }
          
          if (foundNextDay) {
            // We found a day later this week
            const daysToAdd = nextDayOfWeek - currentDayOfWeek;
            console.log(`Found next day this week: ${nextDayOfWeek}, adding ${daysToAdd} days`);
            currentDate = addDays(currentDate, daysToAdd);
          } else {
            // Jump to the first day in the next week (after interval weeks)
            const daysUntilEndOfWeek = 7 - currentDayOfWeek;
            const firstDayOfNextPeriod = sortedWeekdays[0];
            const daysToAdd = daysUntilEndOfWeek + ((interval - 1) * 7) + firstDayOfNextPeriod;
            
            console.log(`Moving to next week period. Adding ${daysToAdd} days`);
            currentDate = addDays(currentDate, daysToAdd);
          }
        } else {
          // Simple weekly recurrence (same day each week)
          console.log(`Simple weekly recurrence, adding ${interval} weeks`);
          currentDate = addWeeks(currentDate, interval);
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
        console.log("Unknown frequency type:", frequency);
        return instances; // Unknown frequency
    }
    
    // Stop if we've reached the endDate (if specified)
    if (endDate && currentDate > endDate) {
      console.log(`Stopping: reached end date ${endDate.toISOString()}`);
      break;
    }
    
    // Stop if we're beyond our display range
    if (currentDate > rangeEnd) {
      console.log(`Stopping: beyond display range ${rangeEnd.toISOString()}`);
      break;
    }
    
    // Add this instance if it's within our range
    if (currentDate >= rangeStart) {
      addInstance(currentDate);
    }
    
    // Safety measure: prevent infinite loops by limiting the total iterations
    if (instanceCount > 100) {
      console.warn("Safety limit reached: generated 100 instances, stopping to prevent infinite loop");
      break;
    }
  }
  
  console.log(`Generated ${instances.length} total instances for event "${event.title}"`);
  return instances;
}

// Convert database event to local Event format
export const convertDbEventToEvent = (dbEvent: any): Event => {
  console.log('Converting DB event to app event:', dbEvent);
  
  if (!dbEvent || !dbEvent.calendar_id) {
    console.error('Invalid DB event:', dbEvent);
    throw new Error('Cannot convert invalid DB event: missing calendar_id');
  }
  
  const event = {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    type: dbEvent.type || 'client-meeting',
    calendar: dbEvent.calendar_id,
    location: dbEvent.location || '',
    isRecurring: dbEvent.is_recurring || false,
    attendees: [], // Assume empty for now as they're stored in a separate table
    isAllDay: false,
  };
  
  console.log('Converted event:', event);
  console.log('Calendar ID:', event.calendar, 'Valid:', isValidUUID(event.calendar));
  return event;
};

// Convert local Event to database format
export const convertEventToDbEvent = (eventObj: Event | Omit<Event, 'id'>) => {
  // Log the input for debugging
  console.log('Converting app event to DB event, input:', eventObj);
  
  // Validate calendar ID
  if (!eventObj.calendar) {
    console.error('Missing calendar ID in event:', eventObj);
    throw new Error('Missing calendar ID for database operation');
  }
  
  if (!isValidUUID(eventObj.calendar)) {
    console.error('Invalid calendar ID format in event:', eventObj);
    throw new Error(`Invalid calendar ID format: ${eventObj.calendar}`);
  }
  
  // Create a clean database event object with only the fields we need to store
  const dbEvent = {
    title: eventObj.title,
    description: eventObj.description,
    start_time: eventObj.start.toISOString(),
    end_time: eventObj.end.toISOString(),
    location: eventObj.location,
    is_recurring: eventObj.isRecurring || false,
    type: eventObj.type,
    calendar_id: eventObj.calendar,
    updated_at: new Date().toISOString(),
    // Only include ID if it exists in the event object (for updates)
    ...('id' in eventObj ? { id: eventObj.id } : {})
  };
  
  console.log('Converted to DB event:', dbEvent);
  console.log('Calendar ID being used:', dbEvent.calendar_id);
  return dbEvent;
};

// Generate demo events for testing based on the existing calendars
export const generateDemoEvents = (calendars: Calendar[]): Event[] => {
  console.log('Generating demo events with existing calendars:', 
    calendars.map(cal => `${cal.id} (${cal.name})`).join(', ')
  );
  
  // Filter calendars to ensure we only use those with valid UUIDs
  const validCalendars = calendars.filter(cal => isValidUUID(cal.id));
  
  if (validCalendars.length === 0) {
    console.error('No valid calendars found for creating demo events');
    return [];
  }
  
  const calendarMap: Record<string, string> = {};
  
  // Map calendar types to actual calendar IDs
  validCalendars.forEach(cal => {
    if (cal.is_firm) calendarMap['firm'] = cal.id;
    else if (cal.is_statute) calendarMap['statute'] = cal.id;
    else calendarMap['personal'] = cal.id;
  });
  
  // Ensure we have at least one valid calendar ID for demo events
  const defaultCalendarId = validCalendars[0].id;
  console.log('Using calendar IDs:', calendarMap);
  console.log('Default calendar ID for demo events:', defaultCalendarId);
  
  const now = new Date();
  const getDate = (dayOffset: number, hourOffset: number = 0, minuteOffset: number = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(date.getHours() + hourOffset);
    date.setMinutes(date.getMinutes() + minuteOffset);
    return date;
  };
  
  // Generate UUID for demo events
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Use actual calendar IDs from the provided calendars array
  const getCalendarId = (type: 'firm' | 'statute' | 'personal'): string => {
    // First try to get the specific type of calendar
    if (calendarMap[type]) {
      return calendarMap[type];
    }
    
    // If not found, return the first valid calendar ID
    return defaultCalendarId;
  };
  
  // Start building events
  const eventTemplates = [
    {
      title: 'Client Consultation: John Smith',
      dayOffset: 0,
      hourOffset: 1,
      duration: 1, // hours
      type: 'client-meeting' as const,
      calendarType: 'firm',
      description: 'Initial consultation regarding divorce case.',
      location: 'Office - Room 305',
    },
    {
      title: 'Team Meeting',
      dayOffset: 0,
      hourOffset: 4,
      duration: 1,
      type: 'internal-meeting' as const,
      calendarType: 'firm',
      description: 'Weekly team meeting to discuss case progress.',
    },
    {
      title: 'Court Hearing: Johnson v. Smith',
      dayOffset: 1,
      hourOffset: 2,
      duration: 2,
      type: 'court' as const,
      calendarType: 'firm',
      description: 'Status hearing for Johnson divorce case.',
      location: 'County Courthouse - Room 217',
    },
    {
      title: 'Filing Deadline: Thompson Brief',
      dayOffset: 2,
      hourOffset: 5,
      duration: 0.5,
      type: 'deadline' as const,
      calendarType: 'statute',
      description: 'Final deadline for appellate brief submission.',
    },
    {
      title: 'Lunch with Sarah',
      dayOffset: 3,
      hourOffset: 0,
      duration: 1.5,
      type: 'personal' as const,
      calendarType: 'personal',
      location: 'Cafe Bistro',
    }
  ];
  
  // Create events from templates
  const events: Event[] = eventTemplates.map(template => {
    const calendarId = getCalendarId(template.calendarType as 'firm' | 'statute' | 'personal');
    console.log(`Creating demo event "${template.title}" with calendar ID: ${calendarId}`);
    
    return {
      id: generateUUID(),
      title: template.title,
      start: getDate(template.dayOffset, template.hourOffset),
      end: getDate(template.dayOffset, template.hourOffset + template.duration),
      type: template.type,
      calendar: calendarId,
      description: template.description || '',
      location: template.location || '',
      isAllDay: false,
    };
  });
  
  // Manually verify all events have valid calendar IDs
  const validEvents = events.filter(event => {
    const isValid = isValidUUID(event.calendar);
    if (!isValid) {
      console.error(`Invalid calendar ID for event "${event.title}": ${event.calendar}`);
    }
    return isValid;
  });
  
  console.log(`Generated ${validEvents.length} valid demo events`);
  return validEvents;
};

// Generate demo calendar data
export const generateDemoCalendars = (): { myCalendars: Calendar[], otherCalendars: Calendar[] } => {
  // Generate proper UUIDs for demo calendars
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const myCalendars: Calendar[] = [
    { 
      id: generateUUID(), 
      name: 'Personal', 
      color: '#5cb85c', 
      checked: true,
      is_firm: false,
      is_statute: false,
      is_public: false
    },
    { 
      id: generateUUID(), 
      name: 'Firm Calendar', 
      color: '#0e91e3', 
      checked: true,
      is_firm: true,
      is_statute: false,
      is_public: true
    },
    { 
      id: generateUUID(), 
      name: 'Statute of Limitations', 
      color: '#d9534f', 
      checked: true,
      is_firm: false,
      is_statute: true,
      is_public: false
    },
  ];
  
  const otherCalendars: Calendar[] = [
    { 
      id: generateUUID(), 
      name: 'Team A', 
      color: '#905ac7', 
      checked: false,
      is_firm: false,
      is_statute: false,
      is_public: true
    },
    { 
      id: generateUUID(), 
      name: 'Team B', 
      color: '#f0ad4e', 
      checked: false,
      is_firm: false,
      is_statute: false,
      is_public: true
    },
  ];

  console.log('Generated demo calendars with valid UUIDs:');
  console.log(myCalendars.map(cal => `${cal.id} (${cal.name})`));
  
  return { myCalendars, otherCalendars };
};
