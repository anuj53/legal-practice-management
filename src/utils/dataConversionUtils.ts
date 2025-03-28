
import { Event, RecurrencePattern } from './calendarTypes';

// Convert database event to app event
export const convertDbEventToEvent = (dbEvent: any): Event => {
  const event: Event = {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    description: dbEvent.description,
    location: dbEvent.location,
    type: dbEvent.type || 'client-meeting',
    calendar: dbEvent.calendar_id,
    isAllDay: dbEvent.is_all_day || false,
    isRecurring: dbEvent.is_recurring || false,
    recurrenceId: dbEvent.recurrence_id,
    
    // Legal case fields
    caseId: dbEvent.case_id,
    clientName: dbEvent.client_name,
    assignedLawyer: dbEvent.assigned_lawyer,
    
    // Court information
    courtInfo: {
      courtName: dbEvent.court_name,
      judgeDetails: dbEvent.judge_details,
      docketNumber: dbEvent.docket_number
    },
    
    // Reminder
    reminder: dbEvent.reminder || 'none',
  };
  
  // Handle recurrence pattern if present
  if (dbEvent.recurrence_pattern && typeof dbEvent.recurrence_pattern === 'object') {
    event.recurrencePattern = dbEvent.recurrence_pattern as RecurrencePattern;
  }
  
  return event;
};

// Convert app event to database event
export const convertEventToDbEvent = (event: Event): any => {
  const dbEvent: any = {
    id: event.id,
    title: event.title,
    description: event.description || '',
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    location: event.location || '',
    type: event.type || 'client-meeting',
    calendar_id: event.calendar,
    is_all_day: event.isAllDay || false,
    is_recurring: event.isRecurring || false,
    recurrence_id: event.recurrenceId,
    
    // Legal case fields
    case_id: event.caseId,
    client_name: event.clientName,
    assigned_lawyer: event.assignedLawyer,
    
    // Court information
    court_name: event.courtInfo?.courtName,
    judge_details: event.courtInfo?.judgeDetails,
    docket_number: event.courtInfo?.docketNumber,
    
    // Reminder
    reminder: event.reminder || 'none',
    
    updated_at: new Date().toISOString()
  };
  
  // Add recurrence pattern
  if (event.recurrencePattern) {
    dbEvent.recurrence_pattern = event.recurrencePattern;
  }
  
  return dbEvent;
};

// Convert event to a recurrence rule db object
export const createRecurrenceRule = (pattern: RecurrencePattern): any => {
  return {
    frequency: pattern.frequency,
    interval: pattern.interval || 1,
    week_days: pattern.weekDays || [],
    month_days: pattern.monthDays || [],
    ends_on: pattern.endsOn ? pattern.endsOn.toISOString() : null,
    ends_after: pattern.endsAfter || null
  };
};
