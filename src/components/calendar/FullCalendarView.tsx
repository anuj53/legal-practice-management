
import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { formatISO } from 'date-fns';
import { expandRecurringEvents } from '@/utils/calendarUtils';
import type { Event } from '@/utils/calendarUtils';
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
  myCalendars?: any[];
  otherCalendars?: any[];
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
  myCalendars = [],
  otherCalendars = []
}: FullCalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const isMobile = useIsMobile();

  const getCalendarColor = (calendarId: string): string => {
    // First check in myCalendars
    const myCalendar = myCalendars.find(cal => cal.id === calendarId);
    if (myCalendar) {
      console.log(`Found color for calendar ${calendarId}: ${myCalendar.color}`);
      return myCalendar.color;
    }
    
    // Then check in otherCalendars
    const otherCalendar = otherCalendars.find(cal => cal.id === calendarId);
    if (otherCalendar) {
      console.log(`Found color for other calendar ${calendarId}: ${otherCalendar.color}`);
      return otherCalendar.color;
    }
    
    console.log(`No color found for calendar ID: ${calendarId}`);
    return '#6B7280';
  };

  const getDefaultColor = (type: string): string => {
    switch (type) {
      case 'client-meeting':
        return '#F97316';
      case 'internal-meeting':
        return '#0EA5E9';
      case 'court':
        return '#8B5CF6';
      case 'deadline':
        return '#EF4444';
      case 'personal':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView(getViewType(view));
      api.gotoDate(date);
    }
  }, [view, date]);

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
  
  console.log('Calendar colors available:', myCalendars.map(cal => ({id: cal.id, color: cal.color})));
  console.log('Events to display:', events.map(e => ({id: e.id, title: e.title, calendarId: e.calendar})));
  
  const calendarEvents = expandedEvents.map(event => {
    // Get calendar color directly from the calendar collection
    const calendarColor = event.calendar ? getCalendarColor(event.calendar) : getDefaultColor(event.type);
    console.log(`Event: ${event.title}, Calendar ID: ${event.calendar}, Color: ${calendarColor}`);
    
    return {
      id: event.id,
      title: event.title,
      start: formatISO(event.start),
      end: formatISO(event.end),
      allDay: event.isAllDay,
      backgroundColor: calendarColor,
      borderColor: calendarColor,
      textColor: 'white',
      extendedProps: {
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern,
        type: event.type,
        calendar: event.calendar
      }
    };
  });

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
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
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        displayEventTime={true}
        displayEventEnd={false}
        eventContent={(eventInfo) => {
          const startTime = eventInfo.event.start 
            ? new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }).format(eventInfo.event.start)
            : '';
            
          // Format to 1:00P instead of 1:00 PM
          const formattedTime = startTime.replace(' AM', 'A').replace(' PM', 'P');
          
          return {
            html: `
              <div class="fc-event-main-frame">
                <div class="fc-event-time">${formattedTime}</div>
                <div class="fc-event-title-container">
                  <div class="fc-event-title fc-sticky">${eventInfo.event.title || ''}</div>
                </div>
              </div>
            `
          };
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
