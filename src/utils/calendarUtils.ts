import { addHours, addDays, subDays, startOfDay } from 'date-fns';

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
  description?: string;
  location?: string;
  type?: string;
  calendar: string;
  color?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  isRecurringInstance?: boolean;
  parentEventId?: string;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    weekdays?: number[];
    monthDay?: number;
    occurrences?: number;
  };
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

// Convert database event to app event
export const convertDbEventToEvent = (dbEvent: any): Event => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    description: dbEvent.description,
    location: dbEvent.location,
    type: dbEvent.type,
    calendar: dbEvent.calendar_id,
    isAllDay: false, // Default
    isRecurring: dbEvent.is_recurring || false,
    recurrencePattern: dbEvent.recurrence_pattern || null,
  };
};

// Convert app event to database event
export const convertEventToDbEvent = (event: Event): any => {
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    location: event.location || '',
    is_recurring: event.isRecurring || false,
    type: event.type || 'client-meeting',
    calendar_id: event.calendar,
    recurrence_pattern: event.recurrencePattern || null,
    updated_at: new Date().toISOString()
  };
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
