
import React, { useRef, useEffect } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  eachDayOfInterval, 
  eachHourOfInterval, 
  startOfDay, 
  addMinutes, 
  isSameDay, 
  isToday 
} from 'date-fns';
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

interface WeekViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function WeekView({
  date,
  events,
  onEventClick
}: WeekViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startDate = startOfWeek(date, {
    weekStartsOn: 1
  }); // Start on Monday
  
  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6)
  });
  
  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: addMinutes(startOfDay(date), 23 * 60)
  });
  
  const hourHeight = 60; // Height of each hour row in pixels

  useEffect(() => {
    // Scroll to 8am
    if (containerRef.current) {
      const scrollPosition = 8 * hourHeight;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [date]);

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

  // Current time indicator
  const now = new Date();
  const currentTimePosition = (now.getHours() * 60 + now.getMinutes()) / 60 * hourHeight;
  
  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex sticky top-0 z-10 bg-white border-b">
        <div className="time-column w-16" />
        {days.map(day => (
          <div key={day.toString()} className={cn("flex-1 day-header text-center py-2", isToday(day) && "bg-blue-50")}>
            <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
            <div className={cn("day-number inline-flex items-center justify-center h-6 w-6 rounded-full", isToday(day) && "bg-yorpro-600 text-white")}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-1">
        <div className="time-column w-16 py-2">
          {hours.map(hour => (
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
        
        <div className="flex-1 flex">
          {days.map(day => (
            <div key={day.toString()} className={cn("flex-1 relative", isToday(day) && "bg-blue-50/30")}>
              {hours.map(hour => (
                <div 
                  key={hour.toString()} 
                  className="hour-row border-t border-gray-200" 
                  style={{ height: `${hourHeight}px` }}
                />
              ))}
              
              {isToday(day) && (
                <div 
                  className="current-time-indicator absolute w-full border-t border-red-500 z-20" 
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                </div>
              )}
              
              {events.filter(event => isSameDay(event.start, day)).map(event => {
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
                      "absolute inset-x-1 rounded px-2 border-l-4",
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
                        {format(event.start, 'h:mm a')}
                      </p>
                      <p className="text-xs truncate">{event.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
