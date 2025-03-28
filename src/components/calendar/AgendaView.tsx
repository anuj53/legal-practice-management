
import React from 'react';
import { format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  events,
  onEventClick,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    const eventDate = new Date(event.start);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    
    eventsByDate[dateKey].push(event);
  });
  
  const sortedDateKeys = Object.keys(eventsByDate).sort();

  const eventColors = {
    'event': 'bg-orange-500 text-white',
    'client': 'bg-green-500 text-white',
    'plan': 'bg-orange-500 text-white',
    'client-meeting': 'bg-green-500 text-white',
    'internal-meeting': 'bg-blue-500 text-white',
    'court': 'bg-purple-500 text-white',
    'deadline': 'bg-red-500 text-white',
    'personal': 'bg-yellow-500 text-black',
  };

  return (
    <div className="agenda-view p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">
          Agenda: {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
      </div>
      
      {sortedDateKeys.length > 0 ? (
        sortedDateKeys.map(dateKey => {
          const date = new Date(dateKey);
          const isCurrentDay = isSameDay(date, new Date());
          
          return (
            <div key={dateKey} className="mb-6">
              <div className={cn(
                "pb-2 mb-2 border-b font-medium",
                isCurrentDay && "text-blue-600"
              )}>
                {format(date, 'EEEE, MMMM d')}
                {isCurrentDay && " (Today)"}
              </div>
              
              <div className="space-y-2">
                {eventsByDate[dateKey].map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded cursor-pointer",
                      eventColors[event.type] || "bg-gray-500 text-white"
                    )}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-sm">
                        {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                      </span>
                    </div>
                    {event.location && (
                      <div className="text-sm mt-1">📍 {event.location}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-gray-500">No events to display</div>
      )}
    </div>
  );
};
