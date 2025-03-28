
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarViewType } from '@/types/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday
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

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium px-2 min-w-[180px] text-center">
          {formatDateRange()}
        </span>
        <Button variant="ghost" size="icon" onClick={onNext}>
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
      </div>
    </div>
  );
};
