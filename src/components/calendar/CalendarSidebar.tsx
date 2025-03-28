
import React from 'react';
import { Plus, Settings, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/types/calendar';

interface CalendarSidebarProps {
  myCalendars: Calendar[];
  otherCalendars: Calendar[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onEditCalendar?: (calendar: Calendar) => void;
}

export function CalendarSidebar({
  myCalendars,
  otherCalendars,
  onCalendarToggle,
  onEditCalendar
}: CalendarSidebarProps) {
  return (
    <div className="h-full bg-white shadow-sm p-4 overflow-auto">
      <h2 className="font-medium text-lg mb-2">My Calendars</h2>
      <div className="space-y-2">
        {myCalendars.map((calendar) => (
          <div key={calendar.id} className="flex items-center justify-between group">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onCalendarToggle(calendar.id, 'my')}
            >
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: calendar.color, opacity: calendar.checked ? 1 : 0.5 }}
              />
              <span className={`text-sm ${calendar.checked ? 'text-gray-900' : 'text-gray-500'}`}>
                {calendar.name}
              </span>
            </div>
            
            {onEditCalendar && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCalendar(calendar);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {otherCalendars.length > 0 && (
        <>
          <h2 className="font-medium text-lg mt-6 mb-2">Other Calendars</h2>
          <div className="space-y-2">
            {otherCalendars.map((calendar) => (
              <div key={calendar.id} className="flex items-center">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => onCalendarToggle(calendar.id, 'other')}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: calendar.color, opacity: calendar.checked ? 1 : 0.5 }}
                  />
                  <span className={`text-sm ${calendar.checked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {calendar.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
