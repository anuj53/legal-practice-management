
import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Calculate current time indicator position and set up auto-scroll
  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Calculate position (each hour is 60px height)
      const position = (hours * 60) + minutes;
      setCurrentTimePosition(position);
      
      // If it's today, scroll to current time - 1 hour
      const isToday = new Date(currentDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
      if (isToday && scrollContainerRef.current) {
        // Scroll to 100px above the current time
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = position - 120;
          }
        }, 100);
      }
    };
    
    // Update position immediately
    updateCurrentTimePosition();
    
    // Set timer to update position
    const timer = setInterval(updateCurrentTimePosition, 60000); // every minute
    
    return () => clearInterval(timer);
  }, [currentDate]);
  
  // Event filtering and display logic
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

  // Calculate event position and height based on its start time and duration
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const startMinutes = start.getMinutes();
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    const topPosition = (startMinutes / 60) * 100; // Convert minutes to percentage of hour height
    const height = (durationMinutes / 60) * 100; // Convert duration to percentage of hour height
    
    return {
      top: `${topPosition}%`,
      height: `${height}%`,
      position: 'absolute' as const,
      left: '0',
      right: '0',
      margin: '0 1px', // Small margin for visual separation
      zIndex: 10, // Add z-index to ensure event is above the cell
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

  // Check if it's today to show the current time indicator
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
                        key={event.id}
                        className={cn(
                          "p-2 rounded cursor-pointer",
                          eventColors[event.type] || "bg-gray-500 text-white"
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Current time indicator */}
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
