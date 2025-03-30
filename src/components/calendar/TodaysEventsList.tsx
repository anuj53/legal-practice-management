
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event, expandRecurringEvents } from '@/utils/calendarUtils';

interface TodaysEventsListProps {
  events: Event[];
  collapsed?: boolean;
  onEventClick?: (event: Event) => void;
  myCalendars?: any[];
  otherCalendars?: any[];
}

export function TodaysEventsList({ 
  events, 
  collapsed = false, 
  onEventClick,
  myCalendars = [],
  otherCalendars = []
}: TodaysEventsListProps) {
  // Expand recurring events so we can catch instances that occur today
  const expandedEvents = expandRecurringEvents(events);
  
  // Filter for today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysEvents = expandedEvents.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= today && eventDate < tomorrow;
  });
  
  // Sort events by start time
  const sortedEvents = [...todaysEvents].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Function to get calendar color based on calendar ID
  const getCalendarColor = (calendarId: string): string | null => {
    // First check in myCalendars
    const myCalendar = myCalendars.find(cal => cal.id === calendarId);
    if (myCalendar) {
      console.log(`Found color for calendar ${calendarId}: ${myCalendar.color}`);
      return myCalendar.color;
    }
    
    // Then check in otherCalendars
    const otherCalendar = otherCalendars.find(cal => cal.id === calendarId);
    if (otherCalendar) {
      console.log(`Found color for other calendar ${calendarId}: ${otherCalendar.color}`);
      return otherCalendar.color;
    }
    
    console.log(`No color found for calendar ID: ${calendarId}`);
    return null;
  };

  if (collapsed) {
    return (
      <div className="px-2 py-3 border-b border-gray-200">
        <div className="bg-gray-100 h-10 w-10 rounded-full mx-auto flex items-center justify-center">
          <CalendarIcon className="h-5 w-5 text-yorpro-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white/90">
      <h3 className="text-sm font-semibold text-yorpro-800 mb-2 flex items-center gap-1.5">
        <CalendarIcon className="h-4 w-4 text-yorpro-600" />
        Today's Events
      </h3>
      
      {sortedEvents.length === 0 ? (
        <div className="text-xs text-gray-500 italic p-2 rounded-lg bg-gray-50">
          No events scheduled for today
        </div>
      ) : (
        <ScrollArea className="h-48 pr-3 -mr-3">
          <div className="space-y-2">
            {sortedEvents.map((event) => {
              // Get calendar color for custom styling
              const calendarColor = event.calendar ? getCalendarColor(event.calendar) : null;
              const hasCalendarColor = calendarColor !== null;
              
              const customStyle = hasCalendarColor ? {
                backgroundColor: calendarColor,
                color: 'white',
                borderLeft: `3px solid ${calendarColor}`
              } : {};
              
              return (
                <div 
                  key={event.id} 
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200/50 shadow-sm"
                  style={hasCalendarColor ? customStyle : { backgroundColor: 'rgb(249 250 251)' }} // default bg-gray-50
                  onClick={() => onEventClick && onEventClick(event)}
                >
                  <div className="text-sm font-medium line-clamp-1">{event.title}</div>
                  <div className="flex items-center text-xs mt-1 gap-1" style={{ opacity: 0.9 }}>
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(event.start), 'h:mm a')}</span>
                    {event.end && (
                      <>
                        <span>-</span>
                        <span>{format(new Date(event.end), 'h:mm a')}</span>
                      </>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-xs mt-1 gap-1" style={{ opacity: 0.9 }}>
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
