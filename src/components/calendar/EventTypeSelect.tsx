
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type EventType = 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';

interface EventTypeSelectProps {
  value: EventType;
  onValueChange: (value: EventType) => void;
  disabled?: boolean;
}

export function EventTypeSelect({ 
  value, 
  onValueChange, 
  disabled = false 
}: EventTypeSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={(value) => onValueChange(value as EventType)}
      disabled={disabled}
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Select event type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="client-meeting">Client Meeting</SelectItem>
        <SelectItem value="internal-meeting">Internal Meeting</SelectItem>
        <SelectItem value="court">Court</SelectItem>
        <SelectItem value="deadline">Deadline</SelectItem>
        <SelectItem value="personal">Personal</SelectItem>
      </SelectContent>
    </Select>
  );
}
