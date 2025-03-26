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
  console.log('Converting DB event to app event:', dbEvent);
  
  const event = {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    type: dbEvent.type || 'client-meeting',
    calendar: dbEvent.calendar_id,
    location: dbEvent.location || '',
    isRecurring: dbEvent.is_recurring || false,
    attendees: [], // Assume empty for now as they're stored in a separate table
    isAllDay: false,
  };
  
  console.log('Converted event:', event);
  return event;
};

// Convert local Event to database format
export const convertEventToDbEvent = (eventObj: Event | Omit<Event, 'id'>) => {
  // Create a clean database event object with only the fields we need to store
  const dbEvent = {
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
  
  console.log('Converting app event to DB event:', dbEvent);
  return dbEvent;
};

// Generate demo events for testing based on the existing calendars
export const generateDemoEvents = (calendars: Calendar[]): Event[] => {
  console.log('Generating demo events with existing calendars:', 
    calendars.map(cal => `${cal.id} (${cal.name})`).join(', ')
  );
  
  const calendarMap: Record<string, string> = {};
  
  // Map calendar types to actual calendar IDs
  calendars.forEach(cal => {
    if (cal.is_firm) calendarMap['firm'] = cal.id;
    else if (cal.is_statute) calendarMap['statute'] = cal.id;
    else calendarMap['personal'] = cal.id;
  });
  
  console.log('Using calendar IDs:', calendarMap);
  
  const now = new Date();
  const getDate = (dayOffset: number, hourOffset: number = 0, minuteOffset: number = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(date.getHours() + hourOffset);
    date.setMinutes(date.getMinutes() + minuteOffset);
    return date;
  };
  
  // Generate UUID for demo events
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Use actual calendar IDs from the provided calendars array
  const getCalendarId = (type: 'firm' | 'statute' | 'personal'): string => {
    return calendarMap[type] || calendars[0]?.id || generateUUID();
  };
  
  const events: Event[] = [
    {
      id: generateUUID(),
      title: 'Client Consultation: John Smith',
      start: getDate(0, 1),
      end: getDate(0, 2),
      type: 'client-meeting',
      calendar: getCalendarId('firm'),
      description: 'Initial consultation regarding divorce case.',
      location: 'Office - Room 305',
      attendees: ['John Smith'],
      caseId: 'DIV-2023-105',
      clientName: 'John Smith',
      assignedLawyer: 'Jane Roberts',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Team Meeting',
      start: getDate(0, 4),
      end: getDate(0, 5),
      type: 'internal-meeting',
      calendar: getCalendarId('firm'),
      description: 'Weekly team meeting to discuss case progress.',
      attendees: ['Amy Johnson', 'Michael Lee', 'Sarah Wilson'],
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Court Hearing: Smith v. Jones',
      start: getDate(1, 9),
      end: getDate(1, 12),
      type: 'court',
      calendar: getCalendarId('firm'),
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
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Filing Deadline: Johnson Estate',
      start: getDate(2, 17),
      end: getDate(2, 17.5),
      type: 'deadline',
      calendar: getCalendarId('statute'),
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
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Lunch with Sarah',
      start: getDate(-1, 12),
      end: getDate(-1, 13),
      type: 'personal',
      calendar: getCalendarId('personal'),
      location: 'Café Bistro',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Expert Witness Preparation',
      start: getDate(3, 14),
      end: getDate(3, 16),
      type: 'internal-meeting',
      calendar: getCalendarId('firm'),
      description: 'Meeting with expert witness Dr. Phillips to prepare for trial testimony.',
      location: 'Conference Room B',
      attendees: ['Dr. Phillips', 'Amy Johnson'],
      caseId: 'LIT-2023-078',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Document Review: Williams Case',
      start: getDate(-2, 9),
      end: getDate(-2, 12),
      type: 'internal-meeting',
      calendar: getCalendarId('personal'),
      description: 'Review discovery documents for Williams litigation case.',
      caseId: 'LIT-2023-067',
      clientName: 'Williams Corp',
      assignedLawyer: 'Stephanie Davis',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Client Meeting: Robert Davis',
      start: getDate(16),
      end: getDate(17),
      type: 'client-meeting',
      calendar: getCalendarId('personal'),
      location: 'Virtual - Zoom',
      description: 'Follow-up meeting to discuss settlement options.',
      attendees: ['Robert Davis'],
      caseId: 'SET-2023-042',
      clientName: 'Robert Davis',
      assignedLawyer: 'Jane Roberts',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Mediator Conference',
      start: getDate(4, 10),
      end: getDate(4, 14),
      type: 'court',
      calendar: getCalendarId('firm'),
      location: 'Mediation Center - Suite 400',
      description: 'Mediation session for Roberts divorce case.',
      attendees: ['Mediator: James Wilson', 'Opposing Counsel: Jane Smith'],
      caseId: 'DIV-2023-091',
      clientName: 'Roberts Family',
      assignedLawyer: 'Sarah Wilson',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Statute Deadline: Tax Filing',
      start: getDate(10, 23.5),
      end: getDate(10, 23.75),
      type: 'deadline',
      calendar: getCalendarId('statute'),
      description: 'Final deadline for corporate tax filing.',
      caseId: 'TAX-2023-028',
      clientName: 'ABC Corporation',
      assignedLawyer: 'Michael Lee',
      isAllDay: false,
    },
    {
      id: generateUUID(),
      title: 'Bar Association Annual Conference',
      start: getDate(15),
      end: getDate(18),
      type: 'personal',
      calendar: getCalendarId('personal'),
      location: 'Hilton Downtown Hotel',
      description: 'Annual bar association conference with workshops and networking events.',
      isRecurring: false,
      isAllDay: true,
    },
    {
      id: generateUUID(),
      title: 'Client Status Meeting (Recurring)',
      start: getDate(5, 11),
      end: getDate(5, 12),
      type: 'client-meeting',
      calendar: getCalendarId('personal'),
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
      isAllDay: false,
    }
  ];
  
  console.log(`Generated ${events.length} demo events with actual calendar IDs`);
  return events;
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
