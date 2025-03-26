
import React from 'react';
import { 
  format, 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay
} from 'date-fns';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
}

interface MonthViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
}

export function MonthView({ date, events, onEventClick, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group events by day
  const eventsByDay = days.map(day => ({
    date: day,
    events: events.filter(event => isSameDay(event.start, day))
  }));
  
  return (
    <div className="flex flex-col h-full overflow-auto custom-scrollbar">
      <div className="grid grid-cols-7 border-b">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1">
        {eventsByDay.map(({ date: day, events }) => (
          <div 
            key={day.toString()}
            className={cn(
              "month-day-cell",
              !isSameMonth(day, date) && "different-month bg-gray-50",
              isToday(day) && "today bg-blue-50/30"
            )}
            onClick={() => onDayClick(day)}
          >
            <div className="flex justify-between items-center mb-1">
              <div className={cn(
                "h-6 w-6 flex items-center justify-center text-sm font-medium",
                isToday(day) && "bg-yorpro-600 text-white rounded-full"
              )}>
                {format(day, 'd')}
              </div>
              
              {events.length > 0 && (
                <span className="text-xs font-medium text-gray-500">
                  {events.length > 1 ? `${events.length} events` : '1 event'}
                </span>
              )}
            </div>
            
            <div className="space-y-1 overflow-y-auto max-h-[80%]">
              {events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className={cn("event-card py-0.5", `event-${event.type}`)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <p className="text-xs truncate">
                    {format(event.start, 'h:mm a')} {event.title}
                  </p>
                </div>
              ))}
              
              {events.length > 3 && (
                <div className="text-xs text-center font-medium text-gray-500">
                  +{events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
