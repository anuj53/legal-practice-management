
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar, CalendarShare } from '@/types/calendar';
import { CalendarList } from './CalendarList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  checked: boolean;
}

interface CalendarSidebarProps {
  myCalendars: CalendarItem[];
  otherCalendars: CalendarItem[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onCreateEvent?: () => void;
}

export function CalendarSidebar({ 
  myCalendars, 
  otherCalendars, 
  onCalendarToggle, 
  onCreateEvent
}: CalendarSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMyCalendars = myCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOtherCalendars = otherCalendars.filter(cal => 
    cal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-l border-gray-200 bg-white h-full flex flex-col">
      <div className="p-4">
        <div className="relative mb-4">
          <Input 
            placeholder="Search calendars" 
            className="pl-3 pr-8 py-1 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <CalendarList 
          title="My calendars" 
          calendars={filteredMyCalendars} 
          category="my" 
          onCalendarToggle={onCalendarToggle} 
        />

        <CalendarList 
          title="Other calendars" 
          calendars={filteredOtherCalendars} 
          category="other" 
          onCalendarToggle={onCalendarToggle} 
        />
      </ScrollArea>
    </div>
  );
}
