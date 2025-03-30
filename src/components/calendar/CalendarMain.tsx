
import React, { useEffect, useRef } from 'react';
import { FullCalendarView } from '@/components/calendar/FullCalendarView';
import { CalendarViewType } from '@/types/calendar';
import type { Event } from '@/utils/calendarUtils';
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
  sidebarCollapsed?: boolean;
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
  onEditCalendar,
  sidebarCollapsed
}: CalendarMainProps) {
  const isMobile = useIsMobile();
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  
  // Force calendar to update its layout when sidebar is collapsed/expanded
  useEffect(() => {
    if (calendarContainerRef.current) {
      // Add a small delay to ensure DOM has updated before triggering resize
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        console.log('Calendar resize triggered due to sidebar state change');
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [sidebarCollapsed]);

  return (
    <div 
      className="h-full overflow-hidden relative" 
      ref={calendarContainerRef}
      key={`calendar-container-${sidebarCollapsed ? 'collapsed' : 'expanded'}-${view}`}
    >
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
        key={`calendar-view-${sidebarCollapsed ? 'collapsed' : 'expanded'}-${view}-${date.toISOString().substring(0, 10)}`} 
        onDateSelect={(start, end) => {
          if (!onCreateEvent) {
            onDayClick(start);
          }
        }}
      />
    </div>
  );
}
