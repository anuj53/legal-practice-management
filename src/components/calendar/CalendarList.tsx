
import React from 'react';
import { ChevronDown } from 'lucide-react';
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
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
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
          <p className="text-xs text-gray-500 py-1">No calendars found</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
