
import React from 'react';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import { CalendarViewType } from '@/types/calendar';
import { Event } from '@/utils/calendarUtils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarMainProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
  onCreateEvent?: (start: Date, end: Date) => void;
  showFullDay: boolean;
  myCalendars?: any[];
  otherCalendars?: any[];
  onCalendarToggle?: (id: string, category: 'my' | 'other') => void;
  onEditCalendar?: (calendar: any) => void;
}

export function CalendarMain({ 
  view, 
  date, 
  events, 
  onEventClick, 
  onDayClick,
  onCreateEvent,
  showFullDay,
  myCalendars = [],
  otherCalendars = [],
  onCalendarToggle,
  onEditCalendar
}: CalendarMainProps) {
  const isMobile = useIsMobile();

  // Enhanced debug events with more details
  console.log('CalendarMain: Events with details:', events.map(event => ({
    id: event.id,
    title: event.title,
    type: event.type,
    eventTypeDetails: {type: event.type, color: event.color},
    attendees: event.attendees?.length || 0,
    reminder: event.reminder,
    caseId: event.caseId,
    clientName: event.clientName,
    courtInfo: event.courtInfo,
    calendar: event.calendar,
    calendarName: myCalendars.find(cal => cal.id === event.calendar)?.name || 
                 otherCalendars.find(cal => cal.id === event.calendar)?.name
  })));

  return (
    <div className="h-full overflow-hidden relative">
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 z-10 md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="h-full">
              <CalendarSidebar 
                myCalendars={myCalendars} 
                otherCalendars={otherCalendars}
                events={events}
                onCalendarToggle={onCalendarToggle}
                onEditCalendar={onEditCalendar}
                onEventClick={onEventClick}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      <FullCalendarView
        view={view}
        date={date}
        events={events}
        onEventClick={onEventClick}
        onDateClick={null}
        onCreateEvent={onCreateEvent}
        showFullDay={showFullDay}
        myCalendars={myCalendars}
        otherCalendars={otherCalendars}
        onDateSelect={(start, end) => {
          if (!onCreateEvent) {
            onDayClick(start);
          }
        }}
      />
    </div>
  );
}
