
import React from 'react';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  days: Date[][];
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  currentMonth,
  onSelectDate,
  selectedDate,
}) => {
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="calendar-grid border rounded-md overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50">
        {weekdays.map((day) => (
          <div 
            key={day} 
            className="text-center py-2 text-xs font-medium text-gray-500 border-b border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {days.flat().map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isCurrentDay = isToday(date);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={cn(
                "h-10 w-full relative p-1 text-center border-r border-b last:border-r-0",
                !isCurrentMonth && "text-gray-300 bg-gray-50",
                isCurrentDay && "font-bold",
                isSelected && "bg-blue-100",
                "hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-full",
                isCurrentDay && "bg-blue-600 text-white"
              )}>
                {format(date, 'd')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
