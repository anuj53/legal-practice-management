
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string; // This is the property name we're standardizing on
  color?: string;
  calendarColor?: string; // Add this property for event display color from associated calendar
  isAllDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  reminder?: 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';
  caseId?: string;
  clientName?: string;
  assignedLawyer?: string;
  courtInfo?: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  documents?: Array<{id: string, name: string, url: string}>;
  
  // Recurrence-related properties
  isRecurring?: boolean;
  recurrenceId?: string;
  recurrencePattern?: RecurrencePattern;
  isException?: boolean;
  originalDate?: Date;
  seriesId?: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  weekDays?: string[]; // For weekly recurrence, e.g. ['MO', 'WE', 'FR']
  monthDays?: number[]; // For monthly recurrence, e.g. [1, 15, 30]
  endsOn?: Date; // If it ends on a specific date
  endsAfter?: number; // Or ends after N occurrences
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  is_firm?: boolean;
  is_statute?: boolean;
  is_public?: boolean;
  isSelected?: boolean;
  isUserCalendar?: boolean;
  user_id?: string;
  owner_user_id?: string;
  type?: 'personal' | 'firm' | 'statute' | 'public';
  sharedWith?: CalendarShare[];
}

export interface CalendarShare {
  id?: string;
  user_email: string;
  permission: 'view' | 'edit' | 'owner';
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'agenda';
