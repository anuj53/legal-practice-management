
import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarShareForm } from './CalendarShareForm';
import { CalendarShare } from '@/types/calendar';

interface CalendarFormProps {
  calendarName: string;
  setCalendarName: (value: string) => void;
  calendarColor: string;
  setCalendarColor: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  sharedWith: CalendarShare[];
  setSharedWith: React.Dispatch<React.SetStateAction<CalendarShare[]>>;
}

export function CalendarForm({
  calendarName,
  setCalendarName,
  calendarColor,
  setCalendarColor,
  isPublic,
  setIsPublic,
  sharedWith,
  setSharedWith
}: CalendarFormProps) {
  const availableColors = [
    '#4caf50', // Green
    '#2196f3', // Blue
    '#f44336', // Red
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#607d8b', // Blue Grey
  ];

  return (
    <div className="space-y-4 py-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Calendar Name</label>
        <Input 
          value={calendarName} 
          onChange={(e) => setCalendarName(e.target.value)}
          placeholder="Enter calendar name"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Calendar Color</label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <div
              key={color}
              onClick={() => setCalendarColor(color)}
              className={`w-6 h-6 rounded-full cursor-pointer ${
                calendarColor === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <Checkbox
            id="is-public"
            checked={isPublic}
            onCheckedChange={(checked) => setIsPublic(checked === true)}
            className="mr-2"
          />
          <label htmlFor="is-public" className="text-sm font-medium cursor-pointer">
            Make calendar public
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Public calendars are visible to other users of the system
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <CalendarShareForm 
          sharedWith={sharedWith}
          setSharedWith={setSharedWith}
        />
      </div>
    </div>
  );
}
