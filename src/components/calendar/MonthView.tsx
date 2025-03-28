
import React from 'react';
import { format, startOfMonth, getMonth, getYear, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { getMonthDaysGrid } from '@/utils/dateUtils';
import { CalendarGrid } from './CalendarGrid';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onSelectDate,
  onEventClick,
}) => {
  const month = getMonth(currentDate);
  const year = getYear(currentDate);
  const monthStart = startOfMonth(currentDate);
  const daysGrid = getMonthDaysGrid(year, month);
  
  const eventColors = {
    'event': 'bg-orange-500 text-white',
    'client': 'bg-green-500 text-white',
    'plan': 'bg-orange-500 text-white',
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(day, new Date(event.start)));
  };

  return (
    <div className="month-view p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{format(monthStart, 'MMMM yyyy')}</h2>
      </div>
      
      <div className="calendar-container">
        <CalendarGrid
          days={daysGrid}
          currentMonth={currentDate}
          onSelectDate={onSelectDate}
        />
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Today's Events</h3>
          <div className="space-y-2">
            {getEventsForDay(new Date()).map(event => (
              <div
                key={event.id}
                className={cn(
                  "p-2 rounded cursor-pointer",
                  eventColors[event.type]
                )}
                onClick={() => onEventClick(event)}
              >
                {format(new Date(event.start), 'h:mm a')} - {event.title}
              </div>
            ))}
            {getEventsForDay(new Date()).length === 0 && (
              <div className="text-gray-500">No events today</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
