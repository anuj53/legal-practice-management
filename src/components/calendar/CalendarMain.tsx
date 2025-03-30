
import React, { useEffect, useRef, useState } from 'react';
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
  const [forceRerender, setForceRerender] = useState(0);
  
  // Force calendar to update its layout when sidebar is collapsed/expanded
  useEffect(() => {
    if (calendarContainerRef.current) {
      // Force a complete re-render by incrementing the state
      setForceRerender(prev => prev + 1);
      console.log('Calendar force rerender triggered due to sidebar state change');
      
      // Also trigger resize events after a delay
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
        forceRerender={forceRerender}
        key={`calendar-view-${sidebarCollapsed ? 'collapsed' : 'expanded'}-${view}-${date.toISOString().substring(0, 10)}-${forceRerender}`} 
        onDateSelect={(start, end) => {
          if (!onCreateEvent) {
            onDayClick(start);
          }
        }}
      />
    </div>
  );
}
