
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'event' | 'client' | 'plan';
  color?: string;
  isAllDay?: boolean;
  description?: string;
  location?: string;
  calendarId: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isSelected: boolean;
  isUserCalendar: boolean;
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'agenda';
