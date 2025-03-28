
import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}) => {
  const hours = getHours();
  
  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      const eventDay = new Date(eventDate);
      eventDay.setHours(0, 0, 0, 0);
      
      const dayToCheck = new Date(currentDate);
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
    'client-meeting': 'bg-green-500 text-white',
    'internal-meeting': 'bg-blue-500 text-white',
    'court': 'bg-purple-500 text-white',
    'deadline': 'bg-red-500 text-white',
    'personal': 'bg-yellow-500 text-black',
  };

  return (
    <div className="day-view overflow-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      <div className="grid grid-cols-1">
        {hours.map((hourLabel, hourIndex) => {
          const hour = hourIndex % 24;
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div 
              key={hourIndex}
              className="grid grid-cols-6 border-b border-gray-200"
            >
              <div className="col-span-1 border-r border-gray-200 p-2 text-center">
                {hourLabel}
              </div>
              
              <div
                className="col-span-5 p-1 min-h-[60px]"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setHours(hour);
                  onTimeSlotClick(newDate);
                }}
              >
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-2 rounded my-1 cursor-pointer",
                      eventColors[event.type] || "bg-gray-500 text-white"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {format(event.start, 'h:mm a')} - {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
