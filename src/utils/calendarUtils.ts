import { addHours, addDays, subDays, startOfDay } from 'date-fns';

// Types we need to move from useCalendarData
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

// Convert database event to local Event format
export const convertDbEventToEvent = (dbEvent: any): Event => {
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
    isAllDay: false,
    // Add other fields with defaults as needed
  };
};

// Convert local Event to database format
export const convertEventToDbEvent = (eventObj: Event | Omit<Event, 'id'>) => {
  // Create a clean database event object with only the fields we need to store
  return {
    title: eventObj.title,
    description: eventObj.description,
    start_time: eventObj.start.toISOString(),
    end_time: eventObj.end.toISOString(),
    location: eventObj.location,
    is_recurring: eventObj.isRecurring || false,
    type: eventObj.type,
    calendar_id: eventObj.calendar,
    updated_at: new Date().toISOString(),
    // Only include ID if it exists in the event object (for updates)
    ...('id' in eventObj ? { id: eventObj.id } : {})
  };
};

// Generate demo events for testing
export const generateDemoEvents = (): Event[] => {
  const now = new Date();
  const today = startOfDay(now);
  
  return [
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
};

// Generate demo calendar data
export const generateDemoCalendars = (): { myCalendars: Calendar[], otherCalendars: Calendar[] } => {
  const myCalendars: Calendar[] = [
    { id: 'personal', name: 'Personal', color: '#5cb85c', checked: true },
    { id: 'firm', name: 'Firm Calendar', color: '#0e91e3', checked: true },
    { id: 'statute', name: 'Statute of Limitations', color: '#d9534f', checked: true },
  ];
  
  const otherCalendars: Calendar[] = [
    { id: 'team-a', name: 'Team A', color: '#905ac7', checked: false },
    { id: 'team-b', name: 'Team B', color: '#f0ad4e', checked: false },
  ];

  return { myCalendars, otherCalendars };
};
