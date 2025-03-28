
import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  days: Date[][];
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  currentMonth,
  onSelectDate,
}) => {
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="calendar-grid">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day) => (
          <div 
            key={day} 
            className="text-center py-2 text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.flat().map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={cn(
                "h-10 w-full rounded p-1 text-center",
                !isCurrentMonth && "text-gray-300",
                isCurrentDay && "bg-blue-100 text-blue-800 font-bold",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
