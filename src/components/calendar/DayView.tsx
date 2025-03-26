
import React, { useRef, useEffect } from 'react';
import { format, addMinutes, startOfDay, eachHourOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
}

interface DayViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function DayView({ date, events, onEventClick }: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayEvents = events.filter(event => isSameDay(event.start, date));
  
  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: addMinutes(startOfDay(date), 23 * 60 + 59)
  });
  
  const hourHeight = 60; // Height of each hour row in pixels
  
  useEffect(() => {
    // Scroll to 8am
    if (containerRef.current) {
      const scrollPosition = 8 * hourHeight; // 8am
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [date]);
  
  // Current time indicator
  const now = new Date();
  const currentDay = isSameDay(date, now);
  const currentTimePosition = currentDay 
    ? ((now.getHours() * 60 + now.getMinutes()) / 60) * hourHeight
    : null;
  
  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-1">
        <div className="time-column py-2">
          {hours.map((hour) => (
            <div key={hour.toString()} className="hour-row flex items-start justify-end">
              <span className="text-xs -mt-2 pr-2">
                {format(hour, 'h a')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 relative">
          {hours.map((hour) => (
            <div key={hour.toString()} className="hour-row border-t border-gray-200" />
          ))}
          
          {currentTimePosition !== null && (
            <div 
              className="current-time-indicator"
              style={{ top: `${currentTimePosition}px` }}
            />
          )}
          
          {todayEvents.map((event) => {
            // Calculate event position
            const eventStartHour = event.start.getHours();
            const eventStartMinute = event.start.getMinutes();
            const eventEndHour = event.end.getHours();
            const eventEndMinute = event.end.getMinutes();
            
            // Calculate position based on minutes since start of day
            const startMinutesSinceMidnight = eventStartHour * 60 + eventStartMinute;
            const endMinutesSinceMidnight = eventEndHour * 60 + eventEndMinute;
            
            // Convert to pixels (hourHeight is pixels per hour, so divide by 60 to get pixels per minute)
            const topPosition = (startMinutesSinceMidnight / 60) * hourHeight;
            const heightInPixels = ((endMinutesSinceMidnight - startMinutesSinceMidnight) / 60) * hourHeight;
            
            // Ensure minimum height for very short events
            const eventHeight = Math.max(heightInPixels, 20);
            
            return (
              <div
                key={event.id}
                className={cn(
                  "event-card absolute left-2 right-2",
                  `event-${event.type}`,
                  "overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                )}
                style={{
                  top: `${topPosition}px`,
                  height: `${eventHeight}px`,
                  zIndex: 10
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="p-1 h-full flex flex-col">
                  <p className="font-medium text-xs whitespace-nowrap">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </p>
                  <p className="font-medium text-sm truncate">{event.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
