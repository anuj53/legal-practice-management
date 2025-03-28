import React, { useEffect, useRef, useState } from 'react';
import { format, addDays, getDate, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateRecurringEventInstances } from '@/utils/recurrenceUtils';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  
  const processedEvents = React.useMemo(() => {
    const allEvents = [...events.filter(event => !event.isRecurring)];
    
    events.filter(event => event.isRecurring && event.recurrencePattern).forEach(recurringEvent => {
      const instances = generateRecurringEventInstances(
        recurringEvent, 
        currentDate, 
        new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      );
      allEvents.push(...instances);
    });
    
    return allEvents;
  }, [events, currentDate]);
  
  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const position = (hours * 60) + minutes;
      setCurrentTimePosition(position);
      
      const isToday = new Date(currentDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
      if (isToday && scrollContainerRef.current) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = position - 120;
          }
        }, 100);
      }
    };
    
    updateCurrentTimePosition();
    
    const timer = setInterval(updateCurrentTimePosition, 60000);
    
    return () => clearInterval(timer);
  }, [currentDate]);
  
  const getEventsForHour = (hour: number) => {
    return processedEvents.filter((event) => {
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

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const startMinutes = start.getMinutes();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    const topPosition = (startMinutes / 60) * 100;
    const height = (durationMinutes / 60) * 100;
    
    return {
      top: `${topPosition}%`,
      height: `${height}%`,
      position: 'absolute' as const,
      left: '0',
      right: '0',
      margin: '0 1px',
      zIndex: 10,
    };
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

  const isToday = new Date(currentDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

  return (
    <div className="day-view h-full flex flex-col">
      <div className="text-center py-4 sticky top-0 bg-background z-10 border-b">
        <h2 className="text-xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto scrollbar-thin"
          ref={scrollContainerRef}
        >
          <div className="relative min-h-[1440px]">
            {hours.map((hourLabel, hourIndex) => {
              const hour = hourIndex % 24;
              const hourEvents = getEventsForHour(hour);
              
              return (
                <div 
                  key={hourIndex}
                  className="flex border-b border-gray-200 h-[60px]"
                >
                  <div className="w-[80px] border-r border-gray-200 p-2 text-right sticky left-0 bg-background">
                    {hourLabel}
                  </div>
                  
                  <div
                    className="flex-1 p-1 relative cursor-pointer"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setHours(hour);
                      onTimeSlotClick(newDate);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={`${event.id}-${event.start.getTime()}`}
                        className={cn(
                          "p-2 rounded cursor-pointer",
                          eventColors[event.type] || "bg-gray-500 text-white",
                          event.isRecurring && "border-l-4 border-white"
                        )}
                        style={getEventStyle(event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="h-full w-full flex flex-col">
                          <div className="truncate font-medium">{format(new Date(event.start), 'h:mm')} {event.title}</div>
                          {event.description && <div className="truncate text-xs opacity-90">{event.description}</div>}
                          {event.isRecurring && <div className="text-xs mt-1">↺ Recurring</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {isToday && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 flex items-center"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="h-3 w-3 rounded-full bg-red-500 -ml-1.5 -mt-1.5"></div>
                <span className="text-xs text-red-500 font-medium ml-1">
                  {format(new Date(), 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
