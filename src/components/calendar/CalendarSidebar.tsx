
import React from 'react';
import { Plus, Settings, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/types/calendar';
import { CalendarList } from './CalendarList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarSidebarProps {
  myCalendars: Calendar[];
  otherCalendars: Calendar[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onEditCalendar?: (calendar: Calendar) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CalendarSidebar({
  myCalendars,
  otherCalendars,
  onCalendarToggle,
  onEditCalendar,
  collapsed = false,
  onToggleCollapse
}: CalendarSidebarProps) {
  return (
    <div className={`h-full bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col rounded-xl border border-gray-200 relative ${collapsed ? 'w-16' : 'w-auto'} transition-all duration-300`}>
      {/* Toggle collapse button */}
      {onToggleCollapse && (
        <Button 
          variant="glass" 
          size="icon" 
          className="absolute top-1/2 -right-3 h-8 w-8 rounded-full shadow-lg border border-white/20 z-20"
          onClick={onToggleCollapse}
        >
          {collapsed ? 
            <ChevronRight className="h-4 w-4" /> : 
            <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      )}
      
      {collapsed ? (
        <div className="flex-1 p-2 flex flex-col items-center gap-2">
          {myCalendars.map(calendar => (
            <div 
              key={calendar.id} 
              className={`h-8 w-8 rounded-full cursor-pointer ${calendar.checked ? 'ring-2 ring-offset-2' : 'opacity-60'}`}
              style={{ backgroundColor: calendar.color }}
              onClick={() => onCalendarToggle(calendar.id, 'my')}
            />
          ))}
          
          {otherCalendars.length > 0 && (
            <>
              <div className="w-full h-px bg-gray-100 my-2"></div>
              {otherCalendars.map(calendar => (
                <div 
                  key={calendar.id} 
                  className={`h-8 w-8 rounded-full cursor-pointer ${calendar.checked ? 'ring-2 ring-offset-2' : 'opacity-60'}`}
                  style={{ backgroundColor: calendar.color }}
                  onClick={() => onCalendarToggle(calendar.id, 'other')}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <CalendarList
            title="My Calendars"
            calendars={myCalendars}
            category="my"
            onCalendarToggle={onCalendarToggle}
            onEditCalendar={onEditCalendar}
          />
          
          {otherCalendars.length > 0 && (
            <CalendarList
              title="Other Calendars"
              calendars={otherCalendars}
              category="other"
              onCalendarToggle={onCalendarToggle}
              onEditCalendar={onEditCalendar}
            />
          )}
        </ScrollArea>
      )}
    </div>
  );
}
