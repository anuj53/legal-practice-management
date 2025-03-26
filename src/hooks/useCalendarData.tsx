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
  
  // Track if data has been updated to trigger a re-fetch
  const [dataUpdated, setDataUpdated] = useState(0);

  // Helper function to convert database event to local Event format
  const convertDbEventToEvent = (dbEvent: any): Event => {
    // This helps with parsing dates from the database
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      start: new Date(dbEvent.start_time),
      end: new Date(dbEvent.end_time),
      type: dbEvent.type || 'client-meeting',
      calendar: dbEvent.calendar_id,
      location: dbEvent.location,
      isRecurring: dbEvent.is_recurring,
      // Map other fields as needed
      attendees: [], // Assume empty for now as they're stored in a separate table
      isAllDay: dbEvent.is_all_day,
      // Add other fields with defaults as needed
    };
  };

  // Fetch calendars
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        // First try to fetch from database
        const { data: calendarsData, error: calendarsError } = await supabase
          .from('calendars')
          .select('*');

        if (calendarsError) {
          console.error('Error fetching calendars from DB:', calendarsError);
          throw calendarsError;
        }

        // If we have data from database, use it
        if (calendarsData && calendarsData.length > 0) {
          // Transform to expected format and separate into my/other calendars
          const myCalendarsData = calendarsData
            .filter(cal => cal.user_id === null || cal.user_id === supabase.auth.getUser())
            .map(cal => ({
              id: cal.id,
              name: cal.name,
              color: cal.color,
              checked: true,
              is_firm: cal.is_firm,
              is_statute: cal.is_statute,
              is_public: cal.is_public,
            }));
          
          const otherCalendarsData = calendarsData
            .filter(cal => cal.user_id !== null && cal.user_id !== supabase.auth.getUser() && cal.is_public)
            .map(cal => ({
              id: cal.id,
              name: cal.name,
              color: cal.color,
              checked: false,
              is_firm: cal.is_firm,
              is_statute: cal.is_statute,
              is_public: cal.is_public,
            }));

          setMyCalendars(myCalendarsData);
          setOtherCalendars(otherCalendarsData);
        } else {
          // Fall back to demo data if no database records
          console.log('No calendars found in DB, using demo data');
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
        }
      } catch (err) {
        console.error('Error in fetchCalendars:', err);
        setError('Failed to load calendars');
        toast.error('Failed to load calendars');
        
        // Fall back to demo data on error
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
      }
    };

    fetchCalendars();
  }, [dataUpdated]); // Refetch when data is updated

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // First try to fetch from the database
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
            is_all_day
          `);

        if (eventsError) {
          console.error('Error fetching events from DB:', eventsError);
          throw eventsError;
        }

        // If we have data from database, use it
        if (eventsData && eventsData.length > 0) {
          console.log('Found events in DB:', eventsData.length);
          const transformedEvents = eventsData.map(convertDbEventToEvent);
          setEvents(transformedEvents);
          setLoading(false);
        } else {
          // Fall back to demo data if no database records
          console.log('No events found in DB, using demo data');
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
        }
      } catch (err) {
        console.error('Error in fetchEvents:', err);
        setError('Failed to load events');
        toast.error('Failed to load events');
        
        // Fall back to demo data on error
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
      }
    };

    fetchEvents();
  }, [dataUpdated]); // Refetch when data is updated

  const updateCalendar = async (calendar: Calendar) => {
    try {
      // First update the database
      const { data, error } = await supabase
        .from('calendars')
        .update({
          name: calendar.name,
          color: calendar.color,
          is_firm: calendar.is_firm || false,
          is_statute: calendar.is_statute || false,
          is_public: calendar.is_public || false,
          updated_at: new Date()
        })
        .eq('id', calendar.id);

      if (error) {
        console.error('Error updating calendar in DB:', error);
        throw error;
      }
      
      console.log('Calendar updated in DB:', data);
      
      // Then update local state
      if (myCalendars.some(cal => cal.id === calendar.id)) {
        setMyCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      } else {
        setOtherCalendars(prev => 
          prev.map(cal => cal.id === calendar.id ? calendar : cal)
        );
      }
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success(`Updated calendar: ${calendar.name}`);
    } catch (err) {
      console.error('Error updating calendar:', err);
      setError('Failed to update calendar');
      toast.error('Failed to update calendar');
    }
  };

  const createCalendar = async (calendar: Omit<Calendar, 'id'>) => {
    try {
      // First create in the database
      const { data, error } = await supabase
        .from('calendars')
        .insert({
          name: calendar.name,
          color: calendar.color,
          is_firm: calendar.is_firm || false,
          is_statute: calendar.is_statute || false,
          is_public: calendar.is_public || false
        })
        .select();

      if (error) {
        console.error('Error creating calendar in DB:', error);
        throw error;
      }
      
      // Get the new calendar with the generated ID
      const newCalendar = {
        ...calendar,
        id: data[0].id,
      } as Calendar;
      
      // Update local state
      setMyCalendars(prev => [...prev, newCalendar]);
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success(`Created new calendar: ${newCalendar.name}`);
      return newCalendar;
    } catch (err) {
      console.error('Error creating calendar:', err);
      setError('Failed to create calendar');
      toast.error('Failed to create calendar');
      
      // Fall back to client-side ID generation for demo mode
      const newCalendar = {
        ...calendar,
        id: Math.random().toString(36).substring(2, 9),
      } as Calendar;
      
      setMyCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
    }
  };

  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      console.log('Creating event in DB:', event);
      
      // Convert the event to the database format
      const dbEvent = {
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        location: event.location,
        is_recurring: event.isRecurring || false,
        type: event.type,
        calendar_id: event.calendar,
        is_all_day: event.isAllDay || false
      };
      
      // First create in the database
      const { data, error } = await supabase
        .from('events')
        .insert(dbEvent)
        .select();

      if (error) {
        console.error('Error creating event in DB:', error);
        throw error;
      }
      
      console.log('Event created in DB:', data);
      
      // Get the new event with the generated ID
      const newEvent = {
        ...event,
        id: data[0].id,
      } as Event;
      
      // Update local state
      setEvents(prev => [...prev, newEvent]);
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event created successfully!');
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      toast.error('Failed to create event');
      
      // Fall back to client-side ID generation for demo mode
      const newEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 9),
      } as Event;
      
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    }
  };

  const updateEvent = async (event: Event) => {
    try {
      console.log('Updating event in DB:', event);
      
      // Convert the event to the database format
      const dbEvent = {
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        location: event.location,
        is_recurring: event.isRecurring || false,
        type: event.type,
        calendar_id: event.calendar,
        is_all_day: event.isAllDay || false,
        updated_at: new Date().toISOString()
      };
      
      // First update in the database
      const { data, error } = await supabase
        .from('events')
        .update(dbEvent)
        .eq('id', event.id)
        .select();

      if (error) {
        console.error('Error updating event in DB:', error);
        throw error;
      }
      
      console.log('Event updated in DB:', data);
      
      // Update local state
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event updated successfully!');
      return event;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error('Failed to update event');
      
      // Still update the local state so UI stays consistent
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      return event;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      console.log('Deleting event from DB:', id);
      
      // First delete from the database
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting event from DB:', error);
        throw error;
      }
      
      console.log('Event deleted from DB');
      
      // Update local state
      setEvents(prev => prev.filter(e => e.id !== id));
      
      // Trigger a data refresh
      setDataUpdated(prev => prev + 1);
      
      toast.success('Event deleted successfully!');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      toast.error('Failed to delete event');
      
      // Still update the local state so UI stays consistent
      setEvents(prev => prev.filter(e => e.id !== id));
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
