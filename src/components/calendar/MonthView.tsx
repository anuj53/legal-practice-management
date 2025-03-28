import React, { useMemo } from 'react';
import { format, isSameMonth, isSameDay, getMonth, getYear } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { getMonthDaysGrid } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { generateRecurringEventInstances } from '@/utils/recurrenceUtils';

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
  const daysGrid = getMonthDaysGrid(year, month);
  
  const processedEvents = useMemo(() => {
    const firstDay = daysGrid[0][0];
    const lastDay = daysGrid[daysGrid.length - 1][6];
    
    const allEvents = [...events.filter(event => !event.isRecurring)];
    
    events.filter(event => event.isRecurring && event.recurrencePattern).forEach(recurringEvent => {
      const instances = generateRecurringEventInstances(recurringEvent, firstDay, lastDay);
      allEvents.push(...instances);
    });
    
    return allEvents;
  }, [events, daysGrid]);
  
  const getEventsForDay = (day: Date) => {
    return processedEvents.filter(event => isSameDay(day, new Date(event.start)));
  };
  
  const getMaxEventsToShow = () => {
    return window.innerWidth > 1024 ? 3 : 2;
  };
  
  const renderEventPill = (event: CalendarEvent) => (
    <div 
      key={`${event.id}-${event.start.getTime()}`}
      className={cn(
        "px-2 py-1 mb-1 text-xs rounded truncate cursor-pointer",
        "text-white",
        event.isRecurring && "border-l-2 border-white"
      )}
      style={{ backgroundColor: event.calendarColor || '#9CA3AF' }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
    >
      {format(new Date(event.start), 'h:mma')} {event.title}
    </div>
  );

  return (
    <div className="month-view h-full overflow-auto">
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="text-center py-3 text-sm font-medium text-gray-500 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 grid-rows-6 h-[calc(100%-2.5rem)]">
        {daysGrid.flat().map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isSameDay(date, new Date());
          const dayEvents = getEventsForDay(date);
          const maxDisplayEvents = getMaxEventsToShow();
          const hasMoreEvents = dayEvents.length > maxDisplayEvents;
          
          return (
            <div
              key={i}
              onClick={() => onSelectDate(date)}
              className={cn(
                "border-r border-b min-h-[90px] p-1 relative",
                !isCurrentMonth && "bg-gray-50"
              )}
            >
              <div className={cn(
                "flex justify-center items-center w-8 h-8 mx-auto",
                isCurrentDay && "bg-blue-600 text-white rounded-full",
                !isCurrentMonth && "text-gray-400"
              )}>
                {format(date, 'd')}
              </div>
              
              <div className="mt-1 overflow-y-auto" style={{ maxHeight: "calc(100% - 32px)" }}>
                {dayEvents.slice(0, maxDisplayEvents).map(event => renderEventPill(event))}
                
                {hasMoreEvents && (
                  <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    +{dayEvents.length - maxDisplayEvents} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
