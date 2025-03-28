
import React, { useEffect, useRef, useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date) => void;
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
      
      // Scroll to current time with offset (100px up from the current time)
      if (scrollContainerRef.current) {
        // Delay the scroll slightly to ensure the container is fully rendered
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
  }, []);

  // Updated function to get events for a day and hour with proper positioning
  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventDay = new Date(eventStart);
      eventDay.setHours(0, 0, 0, 0);
      
      const dayToCheck = new Date(day);
      dayToCheck.setHours(0, 0, 0, 0);
      
      const eventHour = eventStart.getHours();
      
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

  // Check if today falls within this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIndex = days.findIndex(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate.getTime() === today.getTime();
  });

  // Function to handle event click with stopPropagation
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  return (
    <div className="week-view h-full flex flex-col overflow-hidden">
      {/* Headers row - always visible at the top */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex-shrink-0">
        {/* Corner cell - top left empty cell */}
        <div className="col-span-1 border-r border-gray-200 p-2 text-center font-medium">
          Hour
        </div>
        
        {/* Day headers */}
        {days.map((day, index) => (
          <div key={index} className={cn(
            "col-span-1 p-2 text-center border-r border-gray-200",
            new Date(day).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) && "bg-blue-50"
          )}>
            <div className="text-sm text-gray-500">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg font-medium",
              new Date(day).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) && "text-blue-600"
            )}>
              {format(day, 'd/M')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Scrollable content area with fixed hour column */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto scrollbar-thin"
          ref={scrollContainerRef}
        >
          <div className="grid grid-cols-8 relative">
            {hours.map((hourLabel, hourIndex) => (
              <React.Fragment key={hourIndex}>
                {/* Hour label - left side - fixed */}
                <div className="col-span-1 border-r border-b border-gray-200 p-2 text-center sticky left-0 bg-white h-[60px] z-10">
                  {hourLabel}
                </div>
                
                {/* Days columns */}
                {days.map((day, dayIndex) => {
                  const hour = hourIndex % 24;
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  
                  return (
                    <div 
                      key={`${hourIndex}-${dayIndex}`} 
                      className={cn(
                        "col-span-1 border-r border-b border-gray-200 p-1 h-[60px] relative",
                        new Date(day).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) && "bg-blue-50/30"
                      )}
                      onClick={() => {
                        if (onTimeSlotClick) {
                          const newDate = new Date(day);
                          newDate.setHours(hour);
                          onTimeSlotClick(newDate);
                        }
                      }}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-1 rounded text-xs cursor-pointer truncate text-white w-full h-full"
                          style={{ 
                            backgroundColor: event.calendarColor || '#9CA3AF',
                            ...getEventStyle(event)
                          }}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className="h-full w-full flex flex-col">
                            <div className="truncate font-medium">{format(new Date(event.start), 'h:mm')} {event.title}</div>
                            {event.description && <div className="truncate text-xs opacity-90">{event.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            
            {/* Current time indicator */}
            {todayIndex !== -1 && (
              <div 
                className="absolute border-t-2 border-red-500 z-20 flex items-center"
                style={{ 
                  top: `${currentTimePosition}px`, 
                  left: `${(100 / 8) * (todayIndex + 1)}%`,
                  right: '0'
                }}
              >
                <div className="h-3 w-3 rounded-full bg-red-500 -ml-1.5 -mt-1.5"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
