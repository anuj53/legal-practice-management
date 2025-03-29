
import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from 'lucide-react';
import { CalendarViewType } from '@/types/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onDateChange: (date: Date) => void;
  onCreateEvent: () => void;
  onCreateCalendar?: () => void;
  showFullDay?: boolean;
  onToggleFullDay?: (value: boolean) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onCreateEvent,
  onCreateCalendar,
  showFullDay = true,
  onToggleFullDay
}) => {
  const formatDateRange = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    } else if (view === 'day') {
      return format(currentDate, 'MMMM d, yyyy');
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(subDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subDays(currentDate, 7));
    } else {
      // Month or agenda
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() - 1);
      onDateChange(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(addDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addDays(currentDate, 7));
    } else {
      // Month or agenda
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + 1);
      onDateChange(newDate);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        {onToggleFullDay && (
          <div className="flex items-center px-2 mr-2 border rounded-md border-input h-9">
            <Switch
              id="show-full-day"
              checked={showFullDay}
              onCheckedChange={onToggleFullDay}
              className="mr-2"
            />
            <Label htmlFor="show-full-day" className="text-xs font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {showFullDay ? "24h" : "8-18h"}
            </Label>
          </div>
        )}
        
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium px-2 min-w-[180px] text-center">
          {formatDateRange()}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarViewType)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1" 
          onClick={onCreateEvent}
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>

        {onCreateCalendar && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={onCreateCalendar}
          >
            <Calendar className="h-4 w-4" />
            New Calendar
          </Button>
        )}
      </div>
    </div>
  );
};
