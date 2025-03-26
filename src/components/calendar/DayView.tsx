
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
  description?: string;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  reminder?: string;
  // Legal-specific fields
  caseId?: string;
  clientName?: string;
  assignedLawyer?: string;
  courtInfo?: {
    courtName?: string;
    judgeDetails?: string;
    docketNumber?: string;
  };
  documents?: Array<{id: string, name: string, url: string}>;
}

interface DayViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function DayView({ date, events, onEventClick }: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayEvents = events.filter(event => isSameDay(event.start, date));
  
  // Define the height for each hour in pixels
  const hourHeight = 60;
  
  // Generate all hours for the day
  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: addMinutes(startOfDay(date), 23 * 60),
  });
  
  useEffect(() => {
    // Scroll to 8am
    if (containerRef.current) {
      const scrollPosition = 8 * hourHeight;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [date]);
  
  // Current time indicator
  const now = new Date();
  const currentDay = isSameDay(date, now);
  const minutesSinceMidnight = currentDay ? now.getHours() * 60 + now.getMinutes() : 0;
  const currentTimePosition = currentDay ? (minutesSinceMidnight / 60) * hourHeight : null;
  
  // Function to calculate event position and size
  const calculateEventPosition = (event: Event) => {
    const startHours = event.start.getHours();
    const startMinutes = event.start.getMinutes();
    const endHours = event.end.getHours();
    const endMinutes = event.end.getMinutes();
    
    const startMinutesSinceMidnight = (startHours * 60) + startMinutes;
    const endMinutesSinceMidnight = (endHours * 60) + endMinutes;
    
    // Calculate position and height
    const top = (startMinutesSinceMidnight / 60) * hourHeight;
    const height = ((endMinutesSinceMidnight - startMinutesSinceMidnight) / 60) * hourHeight;
    
    // Ensure minimum height for very short events
    return {
      top: `${top}px`,
      height: `${Math.max(height, 20)}px`,
    };
  };
  
  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-1">
        <div className="time-column py-2">
          {hours.map((hour) => (
            <div 
              key={hour.toString()} 
              className="hour-row flex items-start justify-end"
              style={{ height: `${hourHeight}px` }}
            >
              <span className="text-xs -mt-2 pr-2">
                {format(hour, 'h a')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 relative">
          {hours.map((hour) => (
            <div 
              key={hour.toString()} 
              className="hour-row border-t border-gray-200" 
              style={{ height: `${hourHeight}px` }}
            />
          ))}
          
          {currentTimePosition !== null && (
            <div 
              className="current-time-indicator absolute w-full border-t border-red-500 z-20"
              style={{ top: `${currentTimePosition}px` }}
            >
              <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          )}
          
          {todayEvents.map((event) => {
            const { top, height } = calculateEventPosition(event);
            const eventTypeClasses = {
              'client-meeting': 'bg-blue-100 border-blue-400 text-blue-800',
              'internal-meeting': 'bg-teal-100 border-teal-400 text-teal-800',
              'court': 'bg-purple-100 border-purple-400 text-purple-800',
              'deadline': 'bg-red-100 border-red-400 text-red-800',
              'personal': 'bg-orange-100 border-orange-400 text-orange-800',
            };
            
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute left-2 right-2 rounded px-2 border-l-4",
                  eventTypeClasses[event.type],
                  "overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                )}
                style={{
                  top,
                  height,
                  zIndex: 10
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="p-1 h-full flex flex-col overflow-hidden">
                  <p className="font-medium text-xs whitespace-nowrap">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </p>
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  {event.location && (
                    <p className="text-xs truncate opacity-75">{event.location}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
