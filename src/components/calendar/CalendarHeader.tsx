
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
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CalendarRange,
  CalendarDays,
  CalendarCheck,
  Sparkles
} from 'lucide-react';
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

  const getViewIcon = () => {
    switch (view) {
      case 'day':
        return <CalendarCheck className="h-4 w-4 mr-2" />;
      case 'week':
        return <CalendarRange className="h-4 w-4 mr-2" />;
      case 'month':
        return <CalendarDays className="h-4 w-4 mr-2" />;
      case 'agenda':
        return <CalendarIcon className="h-4 w-4 mr-2" />;
      default:
        return <CalendarIcon className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="flex flex-col px-1 py-3 md:flex-row md:justify-between md:items-center mb-2 bg-gradient-to-r from-yorpro-50 to-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-2 md:mb-0 px-2">
        {onToggleFullDay && (
          <div className="flex items-center mr-2 bg-white border rounded-md border-input h-9 px-2 shadow-sm">
            <Switch
              id="show-full-day"
              checked={showFullDay}
              onCheckedChange={onToggleFullDay}
              className="mr-2"
            />
            <Label htmlFor="show-full-day" className="text-xs font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1 text-yorpro-600" />
              {showFullDay ? "24h" : "8-18h"}
            </Label>
          </div>
        )}
        
        <Button variant="default" size="sm" onClick={handleToday} 
                className="bg-yorpro-600 hover:bg-yorpro-700 text-white font-medium">
          Today
        </Button>
        
        <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200">
          <Button variant="ghost" size="icon" onClick={handlePrevious} className="text-yorpro-600 hover:text-yorpro-700 hover:bg-yorpro-50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-lg font-bold px-3 text-yorpro-800">
            {formatDateRange()}
          </span>
          
          <Button variant="ghost" size="icon" onClick={handleNext} className="text-yorpro-600 hover:text-yorpro-700 hover:bg-yorpro-50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 px-2">
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarViewType)}
        >
          <SelectTrigger className="w-[130px] bg-white border-gray-200 shadow-sm">
            <SelectValue placeholder="View">
              <div className="flex items-center">
                {getViewIcon()}
                <span>{view.charAt(0).toUpperCase() + view.slice(1)} View</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day" className="flex items-center">
              <div className="flex items-center">
                <CalendarCheck className="h-4 w-4 mr-2 text-yorpro-600" />
                Day
              </div>
            </SelectItem>
            <SelectItem value="week" className="flex items-center">
              <div className="flex items-center">
                <CalendarRange className="h-4 w-4 mr-2 text-yorpro-600" />
                Week
              </div>
            </SelectItem>
            <SelectItem value="month" className="flex items-center">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-yorpro-600" />
                Month
              </div>
            </SelectItem>
            <SelectItem value="agenda" className="flex items-center">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-yorpro-600" />
                Agenda
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="default" 
          size="sm" 
          className="gap-1 bg-gradient-to-r from-legal-blue to-legal-teal text-white shadow-md hover:shadow-lg transition-all" 
          onClick={onCreateEvent}
        >
          <Plus className="h-4 w-4" />
          New Event
        </Button>

        {onCreateCalendar && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 border-yorpro-300 hover:bg-yorpro-50 shadow-sm" 
            onClick={onCreateCalendar}
          >
            <Sparkles className="h-4 w-4 text-yorpro-600" />
            New Calendar
          </Button>
        )}
      </div>
    </div>
  );
};
