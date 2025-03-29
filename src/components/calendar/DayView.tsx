
import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { getHours } from '@/utils/dateUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, MapPin, Clock } from 'lucide-react';

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
        scrollContainerRef.current.scrollTop = position - 100;
      }
    };
    
    // Update position immediately
    updateCurrentTimePosition();
    
    // Set timer to update position
    const timer = setInterval(updateCurrentTimePosition, 60000); // every minute
    
    return () => clearInterval(timer);
  }, [currentDate]);
  
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
    'client-meeting': 'bg-green-500 text-white border-l-4 border-green-600',
    'internal-meeting': 'bg-blue-500 text-white border-l-4 border-blue-600',
    'court': 'bg-purple-500 text-white border-l-4 border-purple-600',
    'deadline': 'bg-red-500 text-white border-l-4 border-red-600',
    'personal': 'bg-yellow-500 text-black border-l-4 border-yellow-600',
  };

  // Check if it's today to show the current time indicator
  const isToday = new Date(currentDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

  return (
    <div className="day-view h-full flex flex-col">
      <div className="text-center py-4 sticky top-0 bg-background z-10 border-b border-gray-200 bg-gradient-to-r from-yorpro-50 to-white">
        <h2 className="text-xl font-bold flex items-center justify-center text-yorpro-800">
          <CalendarDays className="h-5 w-5 mr-2 text-yorpro-600" />
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div 
          ref={scrollContainerRef}
          className="grid grid-cols-1 relative min-h-[1440px]"
        >
          {hours.map((hourLabel, hourIndex) => {
            const hour = hourIndex % 24;
            const hourEvents = getEventsForHour(hour);
            
            return (
              <div 
                key={hourIndex}
                className={cn(
                  "grid grid-cols-6 border-b border-gray-200 h-[60px]",
                  hour >= 8 && hour < 18 && "bg-gray-50/50"
                )}
              >
                <div className="col-span-1 border-r border-gray-200 p-2 text-center sticky left-0 bg-background flex items-center justify-center">
                  <div className="text-xs font-medium text-gray-600 flex flex-col items-center">
                    <Clock className="h-3 w-3 mb-1 text-yorpro-500" />
                    {hourLabel}
                  </div>
                </div>
                
                <div
                  className="col-span-5 p-1 relative hover:bg-yorpro-50 transition-colors cursor-pointer"
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
                        "p-2 rounded-md my-1 cursor-pointer shadow-sm hover:shadow-md transition-shadow",
                        eventColors[event.type] || "bg-gray-500 text-white"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs opacity-80">
                          {format(event.start, 'h:mm a')}
                        </span>
                      </div>
                      {event.location && (
                        <div className="mt-1 text-xs flex items-center opacity-90">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
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
      </ScrollArea>
    </div>
  );
};
