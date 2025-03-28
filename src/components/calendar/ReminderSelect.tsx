
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Update ReminderType to align with the values used in calendar.ts
type ReminderType = 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';

interface ReminderSelectProps {
  value: ReminderType;
  onValueChange: (value: ReminderType) => void;
  disabled?: boolean;
}

export function ReminderSelect({
  value,
  onValueChange,
  disabled = false
}: ReminderSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onValueChange(value as ReminderType)}
      disabled={disabled}
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Select reminder time" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No reminder</SelectItem>
        <SelectItem value="5min">5 minutes before</SelectItem>
        <SelectItem value="15min">15 minutes before</SelectItem>
        <SelectItem value="30min">30 minutes before</SelectItem>
        <SelectItem value="1hour">1 hour before</SelectItem>
        <SelectItem value="1day">1 day before</SelectItem>
      </SelectContent>
    </Select>
  );
}
