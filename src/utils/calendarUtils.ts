import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  calendar: string;
  color?: string;
  location?: string;
  description?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    occurrences?: number;
    endDate?: Date;
    weekDays?: string[];
    monthDays?: number[];
  };
  attendees?: string[];
  reminder?: string;
  caseId?: string;
  clientName?: string;
  assignedLawyer?: string;
  courtInfo?: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  isSelected?: boolean;
  is_firm: boolean;
  is_statute: boolean;
  is_public: boolean;
  sharedWith: Array<{
    user_email: string;
    permission: 'view' | 'edit' | 'admin';
  }>;
}

// Validate a string as UUID
export const isValidUUID = (str: string): boolean => {
  // UUID regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Convert database event to app event
export const convertDbEventToEvent = (dbEvent: any, eventTypeMap?: Record<string, any>, calendars?: Calendar[]): Event => {
  // Parse recurrence pattern if exists
  let recurrencePattern = undefined;
  if (dbEvent.recurrence_pattern) {
    try {
      recurrencePattern = typeof dbEvent.recurrence_pattern === 'string' 
        ? JSON.parse(dbEvent.recurrence_pattern) 
        : dbEvent.recurrence_pattern;
      
      // Convert dates from ISO strings to Date objects
      if (recurrencePattern.endDate) {
        recurrencePattern.endDate = new Date(recurrencePattern.endDate);
      }
    } catch (e) {
      console.error('Error parsing recurrence pattern:', e);
    }
  }
  
  // Get event type name and color from the map
  let eventType = 'default';
  let eventColor = '#4caf50'; // Default color
  
  if (dbEvent.event_type_id && eventTypeMap && eventTypeMap[dbEvent.event_type_id]) {
    eventType = eventTypeMap[dbEvent.event_type_id].name;
    eventColor = eventTypeMap[dbEvent.event_type_id].color || eventColor;
    console.log(`Found event type for ${dbEvent.title}: ${eventType}, color: ${eventColor}`);
  }
  
  // Try to get calendar color if calendars are provided
  if (calendars && dbEvent.calendar_id) {
    const calendar = calendars.find(cal => cal.id === dbEvent.calendar_id);
    if (calendar) {
      eventColor = calendar.color;
      console.log(`Using calendar color for event ${dbEvent.title}: ${eventColor} from calendar ${calendar.name}`);
    }
  }
  
  // Create the court info object if any of the court fields exist
  const courtInfo = (dbEvent.court_name || dbEvent.judge_details || dbEvent.docket_number) ? {
    courtName: dbEvent.court_name || undefined,
    judgeDetails: dbEvent.judge_details || undefined,
    docketNumber: dbEvent.docket_number || undefined
  } : undefined;
  
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    type: eventType,
    color: eventColor,
    calendar: dbEvent.calendar_id,
    location: dbEvent.location || '',
    description: dbEvent.description || '',
    isAllDay: dbEvent.is_all_day || false,
    isRecurring: dbEvent.is_recurring || false,
    recurrencePattern: recurrencePattern,
    caseId: dbEvent.case_id || undefined,
    clientName: dbEvent.client_name || undefined,
    assignedLawyer: dbEvent.assigned_lawyer || undefined,
    courtInfo: courtInfo
  };
};

// Convert app event to database event
export const convertEventToDbEvent = (event: Event) => {
  return {
    title: event.title,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    location: event.location || null,
    description: event.description || null,
    calendar_id: event.calendar,
    is_recurring: event.isRecurring || false,
    recurrence_pattern: event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null,
    case_id: event.caseId || null,
    client_name: event.clientName || null,
    assigned_lawyer: event.assignedLawyer || null,
    court_name: event.courtInfo?.courtName || null,
    judge_details: event.courtInfo?.judgeDetails || null,
    docket_number: event.courtInfo?.docketNumber || null
  };
};

// Function to expand recurring events for rendering in the calendar
export const expandRecurringEvents = (events: Event[]): Event[] => {
  const expandedEvents: Event[] = [];
  
  events.forEach(event => {
    // Add the original event
    expandedEvents.push(event);
    
    // If the event is not recurring, we're done
    if (!event.isRecurring || !event.recurrencePattern) {
      return;
    }
    
    const { frequency, interval, occurrences, endDate } = event.recurrencePattern;
    
    // Basic implementation for daily, weekly, and monthly recurrences
    // This can be expanded with more complex rules as needed
    
    // Determine how many occurrences to generate
    let maxOccurrences = occurrences || 10; // Default to 10 if not specified
    
    // Calculate end date for recurrence
    const recurrenceEndDate = endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)); // Default to 3 months ahead
    
    // Start with the original event date
    let currentDate = new Date(event.start);
    let occurrenceCount = 0;
    
    // Generate occurrences
    while (occurrenceCount < maxOccurrences && currentDate <= recurrenceEndDate) {
      // Skip the first occurrence as it's the original event
      if (occurrenceCount > 0) {
        // Calculate duration of the event
        const duration = event.end.getTime() - event.start.getTime();
        
        // Create a new occurrence
        const occurrenceEvent: Event = {
          ...event,
          id: `${event.id}_occurrence_${occurrenceCount}`,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration)
        };
        
        expandedEvents.push(occurrenceEvent);
      }
      
      // Move to the next occurrence based on frequency and interval
      switch (frequency) {
        case 'daily':
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + interval));
          break;
        case 'weekly':
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + (7 * interval)));
          break;
        case 'monthly':
          currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + interval));
          break;
        case 'yearly':
          currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + interval));
          break;
      }
      
      occurrenceCount++;
    }
  });
  
  return expandedEvents;
};
