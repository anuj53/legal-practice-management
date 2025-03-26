
import React, { useRef, useEffect } from 'react';
import { format, addMinutes, startOfDay, eachHourOfInterval, isSameDay, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Define the height for each hour in pixels - important for consistent positioning
  const hourHeight = 60;
  
  // Generate all hours for the day
  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: addMinutes(startOfDay(date), 23 * 60),
  });
  
  useEffect(() => {
    // Scroll to current time instead of 8am
    if (containerRef.current) {
      const now = new Date();
      // If viewing today, scroll to current time, otherwise scroll to business hours (8am)
      const scrollHour = isSameDay(date, now) ? now.getHours() : 8;
      
      // Add a small offset to show a bit of context before the current hour
      const scrollPosition = (scrollHour - 0.5) * hourHeight;
      containerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [date]);
  
  // Current time indicator
  const now = new Date();
  const currentDay = isSameDay(date, now);
  
  // Function to calculate position in minutes since midnight
  const getMinutesSinceMidnight = (date: Date) => {
    return date.getHours() * 60 + date.getMinutes();
  };
  
  const currentTimePosition = currentDay 
    ? (getMinutesSinceMidnight(now) / 60) * hourHeight
    : null;
  
  // Function to calculate event position and size
  const calculateEventPosition = (event: Event) => {
    const dayStart = startOfDay(date);
    
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

  // Group overlapping events to handle collisions
  const organizeEvents = (events: Event[]) => {
    if (!events.length) return [];
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => 
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
  
  const organizedEvents = organizeEvents(todayEvents);
  
  return (
    <ScrollArea
      ref={containerRef}
      className="h-full"
    >
      <div className="flex flex-1">
        <div className="time-column py-2 pr-2 w-16 text-right sticky left-0 bg-white z-10">
          {hours.map((hour) => (
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
            const width = columnCount > 1 ? `calc(${95 / columnCount}%)` : '95%';
            const left = columnCount > 1 ? `${(95 / columnCount) * columnIndex}%` : '0%';
            
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute rounded px-2 border-l-4",
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
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </p>
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  {event.location && (
                    <p className="text-xs truncate opacity-75">{event.location}</p>
                  )}
                  {event.clientName && (
                    <p className="text-xs truncate opacity-75">Client: {event.clientName}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
