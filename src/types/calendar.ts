
import { Event, Calendar } from '@/utils/calendarUtils';

// Re-export the types from calendarUtils
export type { Event as CalendarEvent, Calendar };

export interface CalendarShare {
  id?: string;
  user_email: string;
  permission: 'view' | 'edit' | 'admin';
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'agenda';
