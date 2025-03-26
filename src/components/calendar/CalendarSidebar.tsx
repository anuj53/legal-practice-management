
import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  onCreateEvent: () => void; // Added this property to fix the TypeScript error
}

export function CalendarSidebar({ myCalendars, otherCalendars, onCalendarToggle, onCreateEvent }: CalendarSidebarProps) {
  const handleCreateCalendar = () => {
    // Implement create calendar functionality
    console.log('Create calendar clicked');
  };

  const CalendarCheckbox = ({ calendar, category }: { calendar: CalendarItem, category: 'my' | 'other' }) => (
    <div className="calendar-list-item">
      <div 
        className={`calendar-checkbox ${calendar.checked ? 'bg-white' : 'bg-transparent'}`}
        style={{ borderColor: calendar.color }}
        onClick={() => onCalendarToggle(calendar.id, category)}
      >
        {calendar.checked && (
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: calendar.color }}></div>
        )}
      </div>
      <span className="flex-1 truncate">{calendar.name}</span>
    </div>
  );

  return (
    <div className="w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto custom-scrollbar">
      <div className="mb-6">
        <Button 
          onClick={handleCreateCalendar}
          variant="outline" 
          className="w-full justify-start gap-2 mb-4 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add New Calendar
        </Button>
        
        <div className="relative mb-4">
          <Input placeholder="Search calendars" className="pl-3 pr-8 py-1 h-9 text-sm" />
        </div>
      </div>

      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>My calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {myCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="my" />
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
          <span>Other calendars</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          {otherCalendars.map(calendar => (
            <CalendarCheckbox key={calendar.id} calendar={calendar} category="other" />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
