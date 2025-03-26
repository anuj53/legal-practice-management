
import React from 'react';
import { format, isSameDay, isToday, isTomorrow } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
}

interface AgendaViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

// Group events by date
const groupEventsByDate = (events: Event[]): { date: Date; events: Event[] }[] => {
  const grouped: { [key: string]: { date: Date; events: Event[] } } = {};
  
  events.forEach(event => {
    const dateStr = format(event.start, 'yyyy-MM-dd');
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: event.start,
        events: []
      };
    }
    
    grouped[dateStr].events.push(event);
  });
  
  return Object.values(grouped).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
};

export function AgendaView({ date, events, onEventClick }: AgendaViewProps) {
  const groupedEvents = groupEventsByDate(events);
  
  const formatDateHeading = (date: Date): string => {
    if (isToday(date)) return `Today, ${format(date, 'MMMM d')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMMM d')}`;
    return format(date, 'EEEE, MMMM d');
  };
  
  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="max-w-3xl mx-auto">
        {groupedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg font-medium text-gray-500">No events scheduled</p>
            <p className="text-sm text-gray-400">Create a new event to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedEvents.map(group => (
              <Collapsible key={group.date.toString()} defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span className="font-medium">
                    {formatDateHeading(group.date)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {group.events
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                          `border-l-${event.type === 'client-meeting' ? 'legal-blue' : 
                            event.type === 'internal-meeting' ? 'legal-teal' : 
                            event.type === 'court' ? 'legal-purple' : 
                            event.type === 'deadline' ? 'legal-red' : 
                            'legal-orange'}`
                        )}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="w-28 shrink-0 text-sm font-medium">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.type === 'client-meeting' ? 'Client Meeting' : 
                             event.type === 'internal-meeting' ? 'Internal Meeting' : 
                             event.type === 'court' ? 'Court Appearance' : 
                             event.type === 'deadline' ? 'Deadline' : 'Personal'}
                          </p>
                        </div>
                      </div>
                    ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
