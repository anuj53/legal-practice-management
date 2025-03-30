
import { addHours, addDays, subDays, startOfDay, addMonths, addWeeks, addYears } from 'date-fns';
import { CalendarShare } from '@/types/calendar';

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
  sharedWith?: CalendarShare[];
  isSelected?: boolean; // Add this property
}

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
  color?: string;
  description?: string;
  location?: string;
  isRecurring?: boolean;
  createdBy?: string;
  attendees?: string[];
  isAllDay?: boolean;
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
}

// Helper function to validate UUID format
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Converter functions for database interactions
export const convertEventToDbEvent = (event: Event) => {
  return {
    id: event.id,
    title: event.title,
    description: event.description || null,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    location: event.location || null,
    is_recurring: event.isRecurring || false,
    recurrence_pattern: event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null,
    calendar_id: event.calendar,
    // Other properties will be handled by the API
  };
};

export const convertDbEventToEvent = (dbEvent: any, eventTypeMap: any = {}): Event => {
  console.log('Converting DB event to Event:', dbEvent);
  
  // Handle possible missing data
  if (!dbEvent) {
    console.error('Empty DB event object provided to converter');
    throw new Error('Cannot convert null or undefined DB event');
  }
  
  if (!dbEvent.start_time || !dbEvent.end_time) {
    console.error('DB event missing required time fields:', dbEvent);
  }
  
  // Get event type info
  let eventType: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal' = 'client-meeting';
  let eventColor = null;
  
  if (dbEvent.event_type_id && eventTypeMap && eventTypeMap[dbEvent.event_type_id]) {
    const typeName = eventTypeMap[dbEvent.event_type_id].name;
    // Ensure the type is one of the allowed types
    if (typeName === 'client-meeting' || 
        typeName === 'internal-meeting' || 
        typeName === 'court' || 
        typeName === 'deadline' || 
        typeName === 'personal') {
      eventType = typeName;
    }
    eventColor = eventTypeMap[dbEvent.event_type_id].color;
  }
  
  // Parse recurrence pattern
  let recurrencePattern = null;
  if (dbEvent.is_recurring && dbEvent.recurrence_pattern) {
    try {
      recurrencePattern = typeof dbEvent.recurrence_pattern === 'string' 
        ? JSON.parse(dbEvent.recurrence_pattern) 
        : dbEvent.recurrence_pattern;
    } catch (e) {
      console.error('Error parsing recurrence pattern:', e);
    }
  }
  
  // Create event object
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    location: dbEvent.location || '',
    isAllDay: false, // Determine if it's an all-day event based on time range
    isRecurring: dbEvent.is_recurring || false,
    type: eventType,
    color: eventColor,
    calendar: dbEvent.calendar_id,
    recurrencePattern: recurrencePattern
  };
};

// This function expands recurring events based on their recurrence pattern
export const expandRecurringEvents = (events: Event[]): Event[] => {
  const expandedEvents: Event[] = [];
  
  events.forEach(event => {
    // If the event is not recurring, just add it and continue
    if (!event.isRecurring || !event.recurrencePattern) {
      expandedEvents.push(event);
      return;
    }
    
    const { frequency, interval, occurrences, endDate } = event.recurrencePattern;
    const eventDuration = event.end.getTime() - event.start.getTime();
    
    let currentDate = new Date(event.start);
    let count = 0; // Start count at 0 since we haven't added any occurrences yet
    
    // For debugging
    console.log(`Expanding recurring event: "${event.title}", frequency: ${frequency}, interval: ${interval}, occurrences: ${occurrences}`);
    
    // Keep adding occurrences until we reach the limit or end date
    while (
      (occurrences ? count < occurrences : true) && 
      (endDate ? currentDate <= endDate : true) &&
      // Safeguard against infinite loops (limit to 100 occurrences if no other limits)
      (!occurrences && !endDate ? count < 100 : true)
    ) {
      // Create a new occurrence for current date
      const newStart = new Date(currentDate);
      const newEnd = new Date(newStart.getTime() + eventDuration);
      
      // Create a new instance with same properties but different dates
      const newEvent: Event = {
        ...event,
        id: count === 0 ? event.id : `${event.id}_occurrence_${count}`,
        start: newStart,
        end: newEnd,
      };
      
      expandedEvents.push(newEvent);
      count++;
      
      // Log the occurrence for debugging
      console.log(`Added occurrence ${count} on ${newStart.toISOString()}`);
      
      // Stop if we've reached the occurrences limit
      if (occurrences && count >= occurrences) {
        break;
      }
      
      // Advance the date based on frequency and interval
      switch (frequency) {
        case 'daily':
          currentDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, interval);
          break;
      }
    }
  });
  
  return expandedEvents;
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
