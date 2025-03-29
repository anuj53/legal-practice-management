
import React, { useEffect, useRef, useState } from 'react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';
import { MapPin } from 'lucide-react';

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

  const getEventsForDayAndHour = (day: Date, hour: number) => {
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
    'client-meeting': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    'internal-meeting': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    'court': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    'deadline': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    'personal': 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black',
  };

  // Check if today falls within this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIndex = days.findIndex(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate.getTime() === today.getTime();
  });

  return (
    <div className="week-view h-full flex flex-col overflow-hidden">
      {/* Headers row - always visible at the top */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex-shrink-0">
        {/* Corner cell - top left empty cell */}
        <div className="col-span-1 border-r border-gray-200 p-2 text-center font-medium bg-gradient-to-r from-gray-50 to-white">
          Hour
        </div>
        
        {/* Day headers */}
        {days.map((day, index) => (
          <div key={index} className={cn(
            "col-span-1 p-2 text-center border-r border-gray-200",
            isToday(day) ? "bg-gradient-to-b from-yorpro-50 to-yorpro-100" : "bg-gradient-to-b from-white to-gray-50"
          )}>
            <div className="text-sm text-gray-500">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg font-medium",
              isToday(day) ? "text-yorpro-700" : "text-gray-700"
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
            {hours.map((hourLabel, hourIndex) => {
              const hour = hourIndex % 24;
              const isBusinessHour = hour >= 8 && hour < 18;
              
              return (
                <React.Fragment key={hourIndex}>
                  {/* Hour label - left side - fixed */}
                  <div className={cn(
                    "col-span-1 border-r border-b border-gray-200 p-2 text-center sticky left-0 h-[60px] z-10",
                    isBusinessHour ? "bg-gray-50" : "bg-white"
                  )}>
                    <div className="text-xs font-medium text-gray-600">
                      {hourLabel}
                    </div>
                  </div>
                  
                  {/* Days columns */}
                  {days.map((day, dayIndex) => {
                    const dayEvents = getEventsForDayAndHour(day, hour);
                    const isDayToday = isToday(day);
                    
                    return (
                      <div 
                        key={`${hourIndex}-${dayIndex}`} 
                        className={cn(
                          "col-span-1 border-r border-b border-gray-200 p-1 h-[60px] relative",
                          isDayToday && "bg-yorpro-50/30",
                          isBusinessHour && "bg-gray-50/40",
                          "hover:bg-yorpro-50/40 transition-colors cursor-pointer"
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
                            className={cn(
                              "p-1 rounded text-xs cursor-pointer truncate shadow-sm hover:shadow-md transition-shadow",
                              eventColors[event.type] || "bg-gray-500 text-white"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {format(event.start, 'h:mm')} {event.title}
                              </span>
                              {event.location && (
                                <MapPin className="h-3 w-3 ml-1 opacity-80" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
            
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
                <div className="h-3 w-3 rounded-full bg-red-500 -ml-1.5 -mt-1.5 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
