
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addHours, format, startOfDay, addDays, subDays, subHours } from 'date-fns';
import { toast } from 'sonner';

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
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
  description?: string;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
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
  isAllDay?: boolean;
}

export const useCalendarData = () => {
  const [myCalendars, setMyCalendars] = useState<Calendar[]>([]);
  const [otherCalendars, setOtherCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendars
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const { data: calendarsData, error: calendarsError } = await supabase
          .from('calendars')
          .select('*');

        if (calendarsError) throw calendarsError;

        // For now, we'll use the demo data for development
        const myCalendarsData: Calendar[] = [
          { id: 'personal', name: 'Personal', color: '#5cb85c', checked: true },
          { id: 'firm', name: 'Firm Calendar', color: '#0e91e3', checked: true },
          { id: 'statute', name: 'Statute of Limitations', color: '#d9534f', checked: true },
        ];
        
        const otherCalendarsData: Calendar[] = [
          { id: 'team-a', name: 'Team A', color: '#905ac7', checked: false },
          { id: 'team-b', name: 'Team B', color: '#f0ad4e', checked: false },
        ];

        setMyCalendars(myCalendarsData);
        setOtherCalendars(otherCalendarsData);
      } catch (err) {
        console.error('Error fetching calendars:', err);
        setError('Failed to load calendars');
        toast.error('Failed to load calendars');
      }
    };

    fetchCalendars();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            start_time,
            end_time,
            location,
            is_recurring,
            type,
            calendar_id,
            calendars(id, name)
          `);

        if (eventsError) throw eventsError;

        // For development, create demo events with legal-specific fields
        const now = new Date();
        const today = startOfDay(now);
        
        const demoEvents: Event[] = [
          {
            id: '1',
            title: 'Client Consultation: John Smith',
            start: addHours(today, 10),
            end: addHours(today, 11),
            type: 'client-meeting',
            calendar: 'personal',
            description: 'Initial consultation regarding divorce case.',
            location: 'Office - Room 305',
            attendees: ['John Smith'],
            caseId: 'DIV-2023-105',
            clientName: 'John Smith',
            assignedLawyer: 'Jane Roberts',
            isAllDay: false
          },
          {
            id: '2',
            title: 'Team Meeting',
            start: addHours(today, 14),
            end: addHours(today, 15),
            type: 'internal-meeting',
            calendar: 'firm',
            description: 'Weekly team meeting to discuss case progress.',
            attendees: ['Amy Johnson', 'Michael Lee', 'Sarah Wilson'],
            isAllDay: false
          },
          {
            id: '3',
            title: 'Court Hearing: Smith v. Jones',
            start: addHours(addDays(today, 1), 9),
            end: addHours(addDays(today, 1), 12),
            type: 'court',
            calendar: 'firm',
            location: 'County Courthouse - Room 203',
            description: 'Preliminary hearing for custody case.',
            caseId: 'FAM-2023-089',
            clientName: 'Mary Smith',
            assignedLawyer: 'Robert Johnson',
            courtInfo: {
              courtName: 'County Family Court',
              judgeDetails: 'Judge William Harrington',
              docketNumber: 'FC-2023-1234'
            },
            isAllDay: false
          },
          {
            id: '4',
            title: 'Filing Deadline: Johnson Estate',
            start: addHours(addDays(today, 2), 17),
            end: addHours(addDays(today, 2), 17.5),
            type: 'deadline',
            calendar: 'statute',
            description: 'Last day to file estate documents.',
            caseId: 'PRB-2023-042',
            clientName: 'Johnson Family',
            assignedLawyer: 'Stephanie Davis',
            documents: [
              {
                id: 'doc1',
                name: 'Estate Inventory',
                url: 'https://example.com/documents/estate-inventory.pdf'
              }
            ],
            isAllDay: false
          },
          {
            id: '5',
            title: 'Lunch with Sarah',
            start: addHours(addDays(today, -1), 12),
            end: addHours(addDays(today, -1), 13),
            type: 'personal',
            calendar: 'personal',
            location: 'Café Bistro',
            isAllDay: false
          },
          {
            id: '6',
            title: 'Expert Witness Preparation',
            start: addHours(addDays(today, 3), 14),
            end: addHours(addDays(today, 3), 16),
            type: 'internal-meeting',
            calendar: 'firm',
            description: 'Meeting with expert witness Dr. Phillips to prepare for trial testimony.',
            location: 'Conference Room B',
            attendees: ['Dr. Phillips', 'Amy Johnson'],
            caseId: 'LIT-2023-078',
            isAllDay: false
          },
          {
            id: '7',
            title: 'Document Review: Williams Case',
            start: addHours(subDays(today, 2), 9),
            end: addHours(subDays(today, 2), 12),
            type: 'internal-meeting',
            calendar: 'personal',
            description: 'Review discovery documents for Williams litigation case.',
            caseId: 'LIT-2023-067',
            clientName: 'Williams Corp',
            assignedLawyer: 'Stephanie Davis',
            isAllDay: false
          },
          {
            id: '8',
            title: 'Client Meeting: Robert Davis',
            start: addHours(today, 16),
            end: addHours(today, 17),
            type: 'client-meeting',
            calendar: 'personal',
            location: 'Virtual - Zoom',
            description: 'Follow-up meeting to discuss settlement options.',
            attendees: ['Robert Davis'],
            caseId: 'SET-2023-042',
            clientName: 'Robert Davis',
            assignedLawyer: 'Jane Roberts',
            isAllDay: false
          },
          {
            id: '9',
            title: 'Mediator Conference',
            start: addHours(addDays(today, 4), 10),
            end: addHours(addDays(today, 4), 14),
            type: 'court',
            calendar: 'firm',
            location: 'Mediation Center - Suite 400',
            description: 'Mediation session for Roberts divorce case.',
            attendees: ['Mediator: James Wilson', 'Opposing Counsel: Jane Smith'],
            caseId: 'DIV-2023-091',
            clientName: 'Roberts Family',
            assignedLawyer: 'Sarah Wilson',
            isAllDay: false
          },
          {
            id: '10',
            title: 'Statute Deadline: Tax Filing',
            start: addHours(addDays(today, 10), 23.5),
            end: addHours(addDays(today, 10), 23.75),
            type: 'deadline',
            calendar: 'statute',
            description: 'Final deadline for corporate tax filing.',
            caseId: 'TAX-2023-028',
            clientName: 'ABC Corporation',
            assignedLawyer: 'Michael Lee',
            isAllDay: false
          },
          {
            id: '11',
            title: 'Bar Association Annual Conference',
            start: addDays(today, 15),
            end: addDays(today, 18),
            type: 'personal',
            calendar: 'personal',
            location: 'Hilton Downtown Hotel',
            description: 'Annual bar association conference with workshops and networking events.',
            isRecurring: false,
            isAllDay: true
          },
          {
            id: '12',
            title: 'Client Status Meeting (Recurring)',
            start: addHours(addDays(today, 5), 11),
            end: addHours(addDays(today, 5), 12),
            type: 'client-meeting',
            calendar: 'personal',
            description: 'Biweekly status meeting with major corporate client',
            location: 'Conference Room A',
            attendees: ['John CEO', 'Sarah CFO'],
            caseId: 'COR-2023-105',
            clientName: 'Major Corp',
            assignedLawyer: 'Jane Roberts',
            isRecurring: true,
            recurrencePattern: {
              frequency: 'weekly',
              interval: 2,
              occurrences: 10
            },
            isAllDay: false
          }
        ];

        setEvents(demoEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        toast.error('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const updateCalendar = async (calendar: Calendar) => {
    try {
      // In a real implementation, we would update the calendar in Supabase
      console.log('Updating calendar:', calendar);
      
      // For now, we'll just update the local state
      if (myCalendars.some(cal => cal.id === calendar.id)) {
        setMyCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      } else {
        setOtherCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      }
      
      toast.success(`Updated calendar: ${calendar.name}`);
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar');
      toast.error('Failed to update calendar');
    }
  };

  const createCalendar = async (calendar: Omit<Calendar, 'id'>) => {
    try {
      // In a real implementation, we would create the calendar in Supabase
      console.log('Creating calendar:', calendar);
      
      // For now, we'll just update the local state
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
      };
      
      setMyCalendars(prev => [...prev, newCalendar as Calendar]);
      toast.success(`Created new calendar: ${newCalendar.name}`);
      return newCalendar as Calendar;
    } catch (err) {
      console.error('Error creating calendar:', err);
      setError('Failed to create calendar');
      toast.error('Failed to create calendar');
      throw err;
    }
  };

  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      // In a real implementation, we would create the event in Supabase
      console.log('Creating event:', event);
      
      // For now, we'll just update the local state
      const newEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 9),
      };
      
      setEvents(prev => [...prev, newEvent as Event]);
      toast.success('Event created successfully!');
      return newEvent as Event;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      toast.error('Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (event: Event) => {
    try {
      // In a real implementation, we would update the event in Supabase
      console.log('Updating event:', event);
      
      // For now, we'll just update the local state
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      toast.success('Event updated successfully!');
      return event;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error('Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // In a real implementation, we would delete the event from Supabase
      console.log('Deleting event:', id);
      
      // For now, we'll just update the local state
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted successfully!');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      toast.error('Failed to delete event');
      throw err;
    }
  };

  return {
    myCalendars,
    otherCalendars,
    events,
    loading,
    error,
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
