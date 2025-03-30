
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { formatISO } from 'date-fns';
import { Event, expandRecurringEvents } from '@/utils/calendarUtils';
import { CalendarViewType } from '@/types/calendar';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullCalendarViewProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick?: ((date: Date) => void) | null;
  onDateSelect?: (start: Date, end: Date) => void;
  onCreateEvent?: (start: Date, end: Date) => void;
  showFullDay?: boolean;
  sidebarCollapsed?: boolean;
}

export function FullCalendarView({
  view,
  date,
  events,
  onEventClick,
  onDateClick,
  onDateSelect,
  onCreateEvent,
  showFullDay = true,
  sidebarCollapsed
}: FullCalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const [prevCollapsed, setPrevCollapsed] = useState(sidebarCollapsed);

  const getDefaultColor = (type: string): string => {
    switch (type) {
      case 'client-meeting':
        return '#F97316'; // Bright Orange
      case 'internal-meeting':
        return '#0EA5E9'; // Ocean Blue
      case 'court':
        return '#8B5CF6'; // Vivid Purple
      case 'deadline':
        return '#EF4444'; // Bright Red
      case 'personal':
        return '#10B981'; // Vibrant Green
      default:
        return '#6B7280'; // Default Gray
    }
  };

  // Update view and date when they change
  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView(getViewType(view));
      api.gotoDate(date);
    }
  }, [view, date]);

  // Handle sidebar collapse state changes
  useEffect(() => {
    if (sidebarCollapsed !== prevCollapsed) {
      setPrevCollapsed(sidebarCollapsed);
      
      // Let the DOM update first
      setTimeout(() => {
        if (calendarRef.current) {
          const api = calendarRef.current.getApi();
          
          // Trigger multiple resize events to ensure FullCalendar updates
          window.dispatchEvent(new Event('resize'));
          requestAnimationFrame(() => {
            api.updateSize();
            window.dispatchEvent(new Event('resize'));
            
            // One more update for good measure
            setTimeout(() => {
              api.updateSize();
            }, 100);
          });
        }
      }, 50);
    }
  }, [sidebarCollapsed, prevCollapsed]);

  const getViewType = (view: CalendarViewType): string => {
    if (isMobile) {
      switch (view) {
        case 'week':
          return 'listWeek';
        case 'day':
          return 'timeGridDay';
        case 'month':
          return 'dayGridMonth';
        case 'agenda':
          return 'listWeek';
        default:
          return 'listWeek';
      }
    } else {
      switch (view) {
        case 'day':
          return 'timeGridDay';
        case 'week':
          return 'timeGridWeek';
        case 'month':
          return 'dayGridMonth';
        case 'agenda':
          return 'listWeek';
        default:
          return 'timeGridWeek';
      }
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const eventId = info.event.id;
    const originalId = eventId.includes('_occurrence_') 
      ? eventId.split('_occurrence_')[0] 
      : eventId;
    
    const originalEvent = events.find(e => e.id === originalId);
    if (originalEvent) {
      const clickedEvent = {
        ...originalEvent,
        start: info.event.start || originalEvent.start,
        end: info.event.end || originalEvent.end
      };
      onEventClick(clickedEvent);
    }
  };

  const handleDateClick = (arg: any) => {
    if (onDateClick) {
      onDateClick(arg.date);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onCreateEvent) {
      onCreateEvent(selectInfo.start, selectInfo.end);
    } 
    else if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  const expandedEvents = expandRecurringEvents(events);
  
  events.filter(e => e.isRecurring).forEach(e => {
    console.log('Recurring event:', e.title, 
      'pattern:', e.recurrencePattern?.frequency, 
      'interval:', e.recurrencePattern?.interval, 
      'occurrences:', e.recurrencePattern?.occurrences);
  });
  
  const calendarEvents = expandedEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: formatISO(event.start),
    end: formatISO(event.end),
    allDay: event.isAllDay,
    backgroundColor: event.color || getDefaultColor(event.type),
    borderColor: event.color || getDefaultColor(event.type),
    textColor: 'white',
    extendedProps: {
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern,
      type: event.type,
      calendar: event.calendar
    }
  }));

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full rounded-lg overflow-hidden transition-all duration-300"
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={getViewType(view)}
        initialDate={date}
        headerToolbar={false}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={onDateClick !== null ? handleDateClick : undefined}
        selectable={true}
        select={handleDateSelect}
        dayMaxEvents={isMobile ? 2 : true}
        nowIndicator={true}
        slotMinTime={showFullDay ? "00:00:00" : "08:00:00"}
        slotMaxTime={showFullDay ? "24:00:00" : "18:00:00"}
        height="100%"
        expandRows={true}
        stickyHeaderDates={true}
        allDaySlot={true}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short'
        }}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '18:00',
        }}
        eventClassNames="rounded-md shadow-sm hover:shadow-md transition-shadow"
        eventMinHeight={24}
        dayHeaderFormat={{
          weekday: isMobile ? 'narrow' : 'short',
          day: 'numeric'
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
      />
    </div>
  );
}
