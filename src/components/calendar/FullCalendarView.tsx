
import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { formatISO } from 'date-fns';
import { Event } from '@/utils/calendarUtils';
import { CalendarViewType } from '@/types/calendar';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';

interface FullCalendarViewProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick?: ((date: Date) => void) | null;
  onDateSelect?: (start: Date, end: Date) => void;
  onCreateEvent?: (start: Date, end: Date) => void;
  showFullDay?: boolean; // New prop to control time range
}

export function FullCalendarView({
  view,
  date,
  events,
  onEventClick,
  onDateClick,
  onDateSelect,
  onCreateEvent,
  showFullDay = true // Default to showing full day
}: FullCalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const getDefaultColor = (type: string): string => {
    switch (type) {
      case 'client-meeting':
        return '#22C55E';
      case 'internal-meeting':
        return '#3B82F6';
      case 'court':
        return '#A855F7';
      case 'deadline':
        return '#EF4444';
      case 'personal':
        return '#F59E0B';
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
  };

  const handleEventClick = (info: EventClickArg) => {
    const eventId = info.event.id;
    const clickedEvent = events.find(e => e.id === eventId);
    if (clickedEvent) {
      onEventClick(clickedEvent);
    }
  };

  const handleDateClick = (arg: any) => {
    // Only process date clicks if the handler is provided and not null
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

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: formatISO(event.start),
    end: formatISO(event.end),
    allDay: event.isAllDay,
    backgroundColor: event.color || getDefaultColor(event.type),
    borderColor: event.color || getDefaultColor(event.type),
  }));

  return (
    <div className="h-full">
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
        dayMaxEvents={true}
        nowIndicator={true}
        slotMinTime={showFullDay ? "00:00:00" : "08:00:00"}  // Dynamically set based on showFullDay prop
        slotMaxTime={showFullDay ? "24:00:00" : "18:00:00"}  // Dynamically set based on showFullDay prop
        height="100%"
        expandRows={true}
        stickyHeaderDates={true}
        allDaySlot={true}
        slotDuration="00:30:00"
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '18:00',
        }}
      />
    </div>
  );
}
