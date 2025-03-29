
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { EventClickArg, DateSelectArg, EventInput, DateClickArg } from '@fullcalendar/core';

interface FullCalendarViewProps {
  events: CalendarEvent[];
  view: CalendarViewType;
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onDateClick?: (date: Date) => void;
}

export const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  events,
  view,
  date,
  onEventClick,
  onDateSelect,
  onDateClick,
}) => {
  // Convert our events to FullCalendar format
  const calendarEvents: EventInput[] = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.isAllDay,
    extendedProps: {
      ...event,
    },
    backgroundColor: event.color || getEventColor(event.type),
    borderColor: event.color || getEventColor(event.type),
  }));

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const originalEvent = events.find(e => e.id === clickInfo.event.id);
    if (originalEvent) {
      onEventClick(originalEvent);
    }
  };

  // Handle date select (for creating events)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  // Handle date click
  const handleDateClick = (arg: DateClickArg) => {
    if (onDateClick) {
      onDateClick(arg.date);
    }
  };

  // Get color based on event type
  function getEventColor(type: string) {
    switch (type) {
      case 'client-meeting':
        return '#22C55E'; // green-500
      case 'internal-meeting':
        return '#3B82F6'; // blue-500
      case 'court':
        return '#A855F7'; // purple-500
      case 'deadline':
        return '#EF4444'; // red-500
      case 'personal':
        return '#F59E0B'; // amber-500
      default:
        return '#6B7280'; // gray-500
    }
  }

  // Map our view type to FullCalendar view
  const getFullCalendarView = () => {
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

  return (
    <div className="h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={getFullCalendarView()}
        headerToolbar={false} // We're using our custom header
        events={calendarEvents}
        initialDate={date}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventClick={handleEventClick}
        select={handleDateSelect}
        dateClick={handleDateClick}
        height="100%"
        nowIndicator={true}
        allDaySlot={true}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        stickyHeaderDates={true}
      />
    </div>
  );
};
