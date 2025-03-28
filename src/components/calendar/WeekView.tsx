
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = getHours();

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const startHour = hour === 12 ? 0 : hour % 12;
    const isPM = hour >= 12;
    
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      const eventDay = new Date(eventDate);
      eventDay.setHours(0, 0, 0, 0);
      
      const dayToCheck = new Date(day);
      dayToCheck.setHours(0, 0, 0, 0);
      
      const isSameDay = eventDay.getTime() === dayToCheck.getTime();
      const isSameHour = eventHour === hour;
      
      return isSameDay && isSameHour;
    });
  };

  const eventColors = {
    'event': 'bg-orange-500 text-white',
    'client': 'bg-green-500 text-white',
    'plan': 'bg-orange-500 text-white',
  };

  return (
    <div className="week-view overflow-auto">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="col-span-1 border-r border-gray-200 p-2 text-center font-medium">
          Hour
        </div>
        {days.map((day, index) => (
          <div key={index} className="col-span-1 p-2 text-center border-r border-gray-200">
            <div className="text-sm text-gray-500">{format(day, 'EEE')}</div>
            <div className="text-lg font-medium">{format(day, 'd/M')}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-8">
        {hours.map((hourLabel, hourIndex) => (
          <React.Fragment key={hourIndex}>
            <div className="col-span-1 border-r border-b border-gray-200 p-2 text-center">
              {hourLabel}
            </div>
            
            {days.map((day, dayIndex) => {
              const hour = hourIndex % 24;
              const dayEvents = getEventsForDayAndHour(day, hour);
              
              return (
                <div 
                  key={`${hourIndex}-${dayIndex}`} 
                  className="col-span-1 border-r border-b border-gray-200 p-1 min-h-[60px]"
                  onClick={() => {
                    const newDate = new Date(day);
                    newDate.setHours(hour);
                    onTimeSlotClick(newDate);
                  }}
                >
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-1 rounded text-xs cursor-pointer",
                        eventColors[event.type]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {format(event.start, 'h:mm')} {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
