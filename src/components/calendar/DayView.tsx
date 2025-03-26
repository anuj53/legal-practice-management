
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
  
  useEffect(() => {
    // Scroll to 8am
    if (containerRef.current) {
      const hourHeight = 60; // Height of each hour row in pixels
      const scrollPosition = 8 * hourHeight; // 8am
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [date]);
  
  // Current time indicator
  const now = new Date();
  const currentDay = isSameDay(date, now);
  const hourHeight = 60; // Height of each hour row in pixels
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
              <span className="text-xs -mt-2">
                {format(hour, 'h a')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            {hours.map((hour) => (
              <div key={hour.toString()} className="hour-row" />
            ))}
            
            {currentTimePosition !== null && (
              <div 
                className="current-time-indicator"
                style={{ top: `${currentTimePosition}px` }}
              />
            )}
            
            {todayEvents.map((event) => {
              const startMinutes = 
                (event.start.getHours() * 60 + event.start.getMinutes());
              
              const endMinutes = 
                (event.end.getHours() * 60 + event.end.getMinutes());
              
              const duration = endMinutes - startMinutes;
              
              // Calculate position in pixels based on hour height
              const top = (startMinutes / 60) * hourHeight;
              const height = Math.max((duration / 60) * hourHeight, 20); // Minimum height of 20px
              
              return (
                <div
                  key={event.id}
                  className={cn("event-card absolute left-2 right-2", `event-${event.type}`)}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <p className="font-medium text-xs">{format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</p>
                  <p className="font-medium truncate">{event.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
