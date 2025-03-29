
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CalendarCheckbox } from './CalendarCheckbox';
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

interface CalendarListProps {
  title: string;
  calendars: CalendarItem[];
  category: 'my' | 'other';
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
}

export function CalendarList({ title, calendars, category, onCalendarToggle }: CalendarListProps) {
  return (
    <Collapsible defaultOpen className="mb-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors group">
        <span className="text-gray-700 group-hover:text-gray-900">{title}</span>
        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <ChevronDown className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 pl-1">
        <div className="space-y-1.5">
          {calendars.map(calendar => (
            <CalendarCheckbox 
              key={calendar.id} 
              id={calendar.id}
              name={calendar.name}
              color={calendar.color}
              checked={calendar.checked}
              category={category}
              onClick={onCalendarToggle}
            />
          ))}
          {calendars.length === 0 && (
            <div className="py-2 px-3 text-xs text-gray-500 rounded-md bg-gray-50 italic">
              No calendars found
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
