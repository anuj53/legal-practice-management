
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string; // This is the property name we're standardizing on
  color?: string;
  isAllDay?: boolean;
  description?: string;
  location?: string;
  isRecurring?: boolean;
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
  documents?: Array<{id: string, name: string, url: string}>;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    weekdays?: number[];
    monthDay?: number;
    occurrences?: number;
  };
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
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'agenda';
