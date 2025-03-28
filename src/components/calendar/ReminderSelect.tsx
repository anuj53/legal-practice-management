
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type ReminderType = 'none' | '5m' | '10m' | '15m' | '30m' | '1h' | '2h' | '1d' | '2d';

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
        <SelectItem value="5m">5 minutes before</SelectItem>
        <SelectItem value="10m">10 minutes before</SelectItem>
        <SelectItem value="15m">15 minutes before</SelectItem>
        <SelectItem value="30m">30 minutes before</SelectItem>
        <SelectItem value="1h">1 hour before</SelectItem>
        <SelectItem value="2h">2 hours before</SelectItem>
        <SelectItem value="1d">1 day before</SelectItem>
        <SelectItem value="2d">2 days before</SelectItem>
      </SelectContent>
    </Select>
  );
}
