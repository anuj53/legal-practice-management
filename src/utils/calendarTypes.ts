
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
  owner_user_id?: string;
  sharedWith?: CalendarShare[];
}

export interface CalendarShare {
  id?: string;
  user_email: string;
  permission: 'view' | 'edit' | 'owner';
}

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  type?: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
  color?: string;
  calendarColor?: string;
  isAllDay?: boolean;
  
  // Recurrence-related properties
  isRecurring?: boolean;
  recurrenceId?: string;
  recurrencePattern?: RecurrencePattern;
  seriesId?: string;
  
  // Legal case fields
  caseId?: string;
  clientName?: string;
  assignedLawyer?: string;
  
  // Court information
  courtInfo?: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  
  // Reminder
  reminder?: 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  weekDays?: string[]; // For weekly recurrence, e.g. ['MO', 'WE', 'FR']
  monthDays?: number[]; // For monthly recurrence, e.g. [1, 15, 30]
  endsOn?: Date; // If it ends on a specific date
  endsAfter?: number; // Or ends after N occurrences
}
