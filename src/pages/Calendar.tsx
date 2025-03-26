
import React, { useState } from 'react';
import { addDays, addHours, format, startOfDay, subDays, subHours } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader, type CalendarView } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { EventModal } from '@/components/calendar/EventModal';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Demo event data
const generateDemoEvents = () => {
  const now = new Date();
  const today = startOfDay(now);
  
  return [
    {
      id: '1',
      title: 'Client Consultation: John Smith',
      start: addHours(today, 10),
      end: addHours(today, 11),
      type: 'client-meeting' as const,
      calendar: 'personal',
      description: 'Initial consultation regarding divorce case.',
      location: 'Office - Room 305',
      attendees: ['John Smith'],
    },
    {
      id: '2',
      title: 'Team Meeting',
      start: addHours(today, 14),
      end: addHours(today, 15),
      type: 'internal-meeting' as const,
      calendar: 'firm',
      description: 'Weekly team meeting to discuss case progress.',
      attendees: ['Amy Johnson', 'Michael Lee', 'Sarah Wilson'],
    },
    {
      id: '3',
      title: 'Court Hearing: Smith v. Jones',
      start: addHours(addDays(today, 1), 9),
      end: addHours(addDays(today, 1), 12),
      type: 'court' as const,
      calendar: 'firm',
      location: 'County Courthouse - Room 203',
      description: 'Preliminary hearing for custody case.',
    },
    {
      id: '4',
      title: 'Filing Deadline: Johnson Estate',
      start: addHours(addDays(today, 2), 17),
      end: addHours(addDays(today, 2), 17.5),
      type: 'deadline' as const,
      calendar: 'statute',
      description: 'Last day to file estate documents.',
    },
    {
      id: '5',
      title: 'Lunch with Sarah',
      start: addHours(addDays(today, -1), 12),
      end: addHours(addDays(today, -1), 13),
      type: 'personal' as const,
      calendar: 'personal',
      location: 'Café Bistro',
    },
    {
      id: '6',
      title: 'Expert Witness Preparation',
      start: addHours(addDays(today, 3), 14),
      end: addHours(addDays(today, 3), 16),
      type: 'internal-meeting' as const,
      calendar: 'firm',
      description: 'Meeting with expert witness Dr. Phillips to prepare for trial testimony.',
      location: 'Conference Room B',
      attendees: ['Dr. Phillips', 'Amy Johnson'],
    },
    {
      id: '7',
      title: 'Document Review: Williams Case',
      start: addHours(subDays(today, 2), 9),
      end: addHours(subDays(today, 2), 12),
      type: 'internal-meeting' as const,
      calendar: 'personal',
      description: 'Review discovery documents for Williams litigation case.',
    },
    {
      id: '8',
      title: 'Client Meeting: Robert Davis',
      start: addHours(today, 16),
      end: addHours(today, 17),
      type: 'client-meeting' as const,
      calendar: 'personal',
      location: 'Virtual - Zoom',
      description: 'Follow-up meeting to discuss settlement options.',
      attendees: ['Robert Davis'],
    },
    {
      id: '9',
      title: 'Mediator Conference',
      start: addHours(addDays(today, 4), 10),
      end: addHours(addDays(today, 4), 14),
      type: 'court' as const,
      calendar: 'firm',
      location: 'Mediation Center - Suite 400',
      description: 'Mediation session for Roberts divorce case.',
      attendees: ['Mediator: James Wilson', 'Opposing Counsel: Jane Smith'],
    },
    {
      id: '10',
      title: 'Statute Deadline: Tax Filing',
      start: addHours(addDays(today, 10), 23.5),
      end: addHours(addDays(today, 10), 23.75),
      type: 'deadline' as const,
      calendar: 'statute',
      description: 'Final deadline for corporate tax filing.',
    },
  ];
};

// Mock calendar data
const mockCalendars = {
  my: [
    { id: 'personal', name: 'Personal', color: '#5cb85c', checked: true },
    { id: 'firm', name: 'Firm Calendar', color: '#0e91e3', checked: true },
    { id: 'statute', name: 'Statute of Limitations', color: '#d9534f', checked: true },
  ],
  other: [
    { id: 'team-a', name: 'Team A', color: '#905ac7', checked: false },
    { id: 'team-b', name: 'Team B', color: '#f0ad4e', checked: false },
  ]
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [events, setEvents] = useState(generateDemoEvents());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [myCalendars, setMyCalendars] = useState(mockCalendars.my);
  const [otherCalendars, setOtherCalendars] = useState(mockCalendars.other);
  
  // Filter events based on selected calendars
  const filteredEvents = events.filter(event => {
    const allCalendars = [...myCalendars, ...otherCalendars];
    const calendar = allCalendars.find(cal => cal.id === event.calendar);
    return calendar?.checked;
  });
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    if (category === 'my') {
      setMyCalendars(prev => 
        prev.map(cal => 
          cal.id === id ? { ...cal, checked: !cal.checked } : cal
        )
      );
    } else {
      setOtherCalendars(prev => 
        prev.map(cal => 
          cal.id === id ? { ...cal, checked: !cal.checked } : cal
        )
      );
    }
  };
  
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
  };
  
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };
  
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleSaveEvent = (event: any) => {
    if (modalMode === 'create') {
      setEvents(prev => [...prev, event]);
      toast.success('Event created successfully!');
    } else {
      setEvents(prev => 
        prev.map(e => e.id === event.id ? event : e)
      );
      toast.success('Event updated successfully!');
    }
  };
  
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Event deleted successfully!');
  };
  
  return (
    <div className="flex h-full flex-col">
      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={currentView}
        onDateChange={setCurrentDate}
        onViewChange={setCurrentView}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'day' && (
            <DayView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
          {currentView === 'week' && (
            <WeekView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
          {currentView === 'month' && (
            <MonthView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === 'agenda' && (
            <AgendaView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>
        
        {/* Sidebar */}
        <CalendarSidebar
          myCalendars={myCalendars}
          otherCalendars={otherCalendars}
          onCalendarToggle={handleCalendarToggle}
        />
      </div>
      
      {/* Floating new event button - visible in mobile when sidebar is hidden */}
      <div className="md:hidden fixed right-4 bottom-4">
        <Button 
          onClick={handleCreateEvent}
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-yorpro-600 hover:bg-yorpro-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        mode={modalMode}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
