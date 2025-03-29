
import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarViewType, Event } from '@/types/calendar';
import { format } from 'date-fns';

interface FullCalendarComponentProps {
  view: CalendarViewType;
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function FullCalendarComponent({
  view,
  date,
  events,
  onEventClick,
  onTimeSlotClick,
}: FullCalendarComponentProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  
  // Automatically go to the specified date whenever it changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
  }, [date]);
  
  // Convert our events format to FullCalendar event format
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.isAllDay || false,
    backgroundColor: event.calendarColor || '#3788d8',
    borderColor: event.calendarColor || '#3788d8',
    textColor: '#ffffff',
    extendedProps: {
      ...event
    }
  }));
  
  // Map our view types to FullCalendar view types
  const fullCalendarView = (() => {
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
  })();
  
  // Log the calendar data for debugging
  console.log('FullCalendar view:', fullCalendarView);
  console.log('FullCalendar date:', date);
  console.log('FullCalendar events:', formattedEvents);
  
  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={fullCalendarView}
        headerToolbar={false} // We'll use our own header
        initialDate={date}
        events={formattedEvents}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="100%"
        firstDay={1} // Start week on Monday
        eventClick={(info) => {
          // Extract the original event object from extendedProps
          const originalEvent = info.event.extendedProps as Event;
          onEventClick(originalEvent);
        }}
        dateClick={(info) => {
          // Convert the clicked date to a JavaScript Date object
          const clickedDate = new Date(info.date);
          onTimeSlotClick(clickedDate);
        }}
        select={(info) => {
          // For time slot selection, use the start date
          const selectedDate = new Date(info.start);
          onTimeSlotClick(selectedDate);
        }}
      />
    </div>
  );
}
