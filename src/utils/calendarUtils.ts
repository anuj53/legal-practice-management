
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  calendar: string;
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
export const convertDbEventToEvent = (dbEvent: any, eventTypeMap?: Record<string, any>): Event => {
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
  if (dbEvent.event_type_id && eventTypeMap && eventTypeMap[dbEvent.event_type_id]) {
    eventType = eventTypeMap[dbEvent.event_type_id].name;
  }
  
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    type: eventType,
    calendar: dbEvent.calendar_id,
    location: dbEvent.location || '',
    description: dbEvent.description || '',
    isRecurring: dbEvent.is_recurring || false,
    recurrencePattern: recurrencePattern
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
    recurrence_pattern: event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null
  };
};
