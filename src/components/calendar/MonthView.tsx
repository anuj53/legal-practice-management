
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth, isSameDay, getMonth, getYear } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { getMonthDaysGrid } from '@/utils/dateUtils';
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
  const daysGrid = getMonthDaysGrid(year, month);
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(day, new Date(event.start)));
  };
  
  const eventColors = {
    'client-meeting': 'bg-orange-500 text-white',
    'internal-meeting': 'bg-blue-500 text-white',
    'court': 'bg-purple-500 text-white',
    'deadline': 'bg-red-500 text-white',
    'personal': 'bg-amber-400 text-black',
  };

  const getMaxEventsToShow = () => {
    return window.innerWidth > 1024 ? 3 : 2;
  };
  
  const renderEventPill = (event: CalendarEvent) => (
    <div 
      key={event.id}
      className={cn(
        "px-2 py-1 mb-1 text-xs rounded truncate cursor-pointer",
        eventColors[event.type] || "bg-gray-500 text-white"
      )}
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
