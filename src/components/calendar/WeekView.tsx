
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
  isToday,
  differenceInMinutes
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

  // Function to get minutes since midnight
  const getMinutesSinceMidnight = (date: Date) => {
    return date.getHours() * 60 + date.getMinutes();
  };

  // Function to calculate event position and size
  const calculateEventPosition = (event: Event) => {
    // Get minutes since midnight for event start and end
    const startMinutes = getMinutesSinceMidnight(event.start);
    const endMinutes = getMinutesSinceMidnight(event.end);
    
    // For events ending next day, cap at end of day
    const adjustedEndMinutes = endMinutes < startMinutes ? 24 * 60 : endMinutes;
    
    // Calculate position and height
    const top = (startMinutes / 60) * hourHeight;
    const height = ((adjustedEndMinutes - startMinutes) / 60) * hourHeight;
    
    // Ensure minimum height for very short events
    return {
      top: `${top}px`,
      height: `${Math.max(height, 20)}px`,
    };
  };

  // Group overlapping events to handle collisions for each day
  const organizeEventsByDay = (dayEvents: Event[]) => {
    if (!dayEvents.length) return [];
    
    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => 
      a.start.getTime() - b.start.getTime() || 
      b.end.getTime() - a.end.getTime()
    );
    
    // Track columns for events
    const columns: Event[][] = [];
    
    sortedEvents.forEach(event => {
      // Try to find a column where this event doesn't overlap
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const columnEvents = columns[i];
        const lastEvent = columnEvents[columnEvents.length - 1];
        
        // If event starts after the last event in this column ends
        if (getMinutesSinceMidnight(event.start) >= getMinutesSinceMidnight(lastEvent.end)) {
          columnEvents.push(event);
          placed = true;
          break;
        }
      }
      
      // If event couldn't be placed in existing columns, create a new column
      if (!placed) {
        columns.push([event]);
      }
    });
    
    // Convert columns data to event display data
    return sortedEvents.map(event => {
      // Find which column this event is in
      const columnIndex = columns.findIndex(column => 
        column.some(e => e.id === event.id)
      );
      
      // Calculate width and left position based on total columns and current column
      return {
        event,
        columnCount: columns.length,
        columnIndex
      };
    });
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
              <span className="text-xs -mt-2 pr-2 text-gray-500">
                {format(hour, 'h a')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 flex">
          {days.map(day => {
            const dayEvents = events.filter(event => isSameDay(event.start, day));
            const organizedEvents = organizeEventsByDay(dayEvents);
            
            return (
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
                
                {organizedEvents.map(({ event, columnCount, columnIndex }) => {
                  const { top, height } = calculateEventPosition(event);
                  const eventTypeClasses = {
                    'client-meeting': 'bg-blue-100 border-blue-400 text-blue-800',
                    'internal-meeting': 'bg-teal-100 border-teal-400 text-teal-800',
                    'court': 'bg-purple-100 border-purple-400 text-purple-800',
                    'deadline': 'bg-red-100 border-red-400 text-red-800',
                    'personal': 'bg-orange-100 border-orange-400 text-orange-800',
                  };
                  
                  // Calculate width and left position for each event
                  const width = columnCount > 1 ? `calc(${90 / columnCount}%)` : '90%';
                  const left = columnCount > 1 ? `${(90 / columnCount) * columnIndex}%` : '5%';
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute rounded px-1 border-l-4",
                        eventTypeClasses[event.type],
                        "overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      )}
                      style={{
                        top,
                        height,
                        width,
                        left,
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
