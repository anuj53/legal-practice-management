import React, { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, getHours, getMinutes } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface EnhancedWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
  workWeekOnly?: boolean;
  showHeader?: boolean;
}

interface EventLayout {
  [key: string]: {
    event: CalendarEvent;
    top: number;
    height: number;
    left: number;
    width: number;
  }[];
}

const TIME_COL_WIDTH = 60; // Width of the time column in pixels
const EVENT_GAP = 2; // Gap between events in pixels

export const EnhancedWeekView: React.FC<EnhancedWeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
  workWeekOnly = false,
  showHeader = true
}) => {
  const [viewMode, setViewMode] = useState<'workweek' | 'fullweek'>('workweek');
  const [timezone, setTimezone] = useState<'local' | 'est' | 'pacific'>('local');
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [showCurrentTimeIndicator, setShowCurrentTimeIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to get the start and end of the week based on the view mode
  const getWeekRange = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    let weekEnd = addDays(weekStart, 6);

    if (viewMode === 'workweek') {
      weekEnd = addDays(weekStart, 4); // Monday to Friday
    }

    return { weekStart, weekEnd };
  };

  // Helper function to calculate the day width
  const calculateDayWidth = () => {
    const { weekStart, weekEnd } = getWeekRange();
    const dayCount = (Number(weekEnd) - Number(weekStart)) / (1000 * 60 * 60 * 24) + 1;
    return `calc((100% - ${TIME_COL_WIDTH}px) / ${dayCount})`;
  };

  // Helper function to calculate event position
  const calculateEventPosition = (event: CalendarEvent, dayStart: Date, dayWidth: string) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const top = (getHours(start) + getMinutes(start) / 60) * 60;
    const height = (getHours(end) + getMinutes(end) / 60) * 60 - top;

    const diffDays = (Number(startOfDay(start)) - Number(startOfDay(dayStart))) / (1000 * 60 * 60 * 24);
    const left = diffDays * parseFloat(dayWidth);

    return { top, height, left, width: parseFloat(dayWidth) };
  };

  // Helper function to check if a date is within the work week
  const isWorkDay = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  };

  // Function to scroll to the current time
  const scrollToCurrentTime = () => {
    if (containerRef.current) {
      const currentTime = new Date();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const timePosition = (hours * 60) + minutes;

      containerRef.current.scrollTop = timePosition - 50; // Subtract 50px for better view
    }
  };

  // Function to update current time position
  const updateCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Calculate position (each hour is 60px height)
    const position = (hours * 60) + minutes;
    setCurrentTimePosition(position);
  };

  // Effect to scroll to current time on component mount and view mode change
  useEffect(() => {
    scrollToCurrentTime();
  }, [viewMode]);

  // Effect to set up interval for updating current time position
  useEffect(() => {
    updateCurrentTimePosition();
    setShowCurrentTimeIndicator(true);

    const intervalId = setInterval(() => {
      updateCurrentTimePosition();
    }, 60000); // Update every minute

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Effect to handle timezone changes
  useEffect(() => {
    // Placeholder for timezone logic
    console.log(`Timezone set to: ${timezone}`);
  }, [timezone]);

  // Render days of the week
  const renderDaysHeader = () => {
    const { weekStart, weekEnd } = getWeekRange();
    const dayWidth = calculateDayWidth();
    const days = [];

    let currentDay = weekStart;
    while (currentDay <= weekEnd) {
      if (viewMode === 'fullweek' || isWorkDay(currentDay)) {
        days.push(
          <div
            key={currentDay.toISOString()}
            className="day flex-1 text-center py-2"
            style={{ width: dayWidth }}
          >
            {format(currentDay, 'EEE d')}
          </div>
        );
      }
      currentDay = addDays(currentDay, 1);
    }

    return days;
  };

  // Render time slots
  const renderTimeSlots = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map(hour => (
      <div
        key={hour}
        className="time-slot h-[60px] border-b text-xs text-gray-500 flex items-center justify-end px-2"
      >
        {format(new Date(0, 0, 0, hour), 'h a')}
      </div>
    ));
  };

  // Render events for the week
  const renderEvents = () => {
    const { weekStart, weekEnd } = getWeekRange();
    const dayWidth = calculateDayWidth();
    const eventLayout: EventLayout = {};

    let currentDay = weekStart;
    let dayIndex = 0;

    while (currentDay <= weekEnd) {
      if (viewMode === 'fullweek' || isWorkDay(currentDay)) {
        const dayKey = format(currentDay, 'yyyy-MM-dd');
        eventLayout[dayKey] = [];

        const dayStart = new Date(currentDay);
        dayStart.setHours(0, 0, 0, 0);

        const dayEvents = events.filter(event => {
          const eventStart = new Date(event.start);
          return isSameDay(eventStart, currentDay);
        });

        dayEvents.forEach(event => {
          const { top, height, left, width } = calculateEventPosition(event, dayStart, dayWidth);
          eventLayout[dayKey].push({ event, top, height, left, width });
        });
      }
      currentDay = addDays(currentDay, 1);
      dayIndex++;
    }

    return Object.keys(eventLayout).map(dayKey => {
      return eventLayout[dayKey].map(({ event, top, height, left, width }) => (
        <div
          key={event.id}
          className="absolute bg-blue-200 border border-blue-500 text-blue-800 text-xs p-1 rounded cursor-pointer"
          style={{
            top: top + 'px',
            height: height + 'px',
            left: TIME_COL_WIDTH + left + 'px',
            width: width + 'px',
          }}
          onClick={() => onEventClick(event)}
        >
          {event.title}
        </div>
      ));
    });
  };

  function startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  return (
    <div className="enhanced-week-view flex flex-col h-full overflow-hidden">
      {showHeader && (
        <div className="flex justify-between items-center px-4 py-2">
          <div className="font-semibold text-lg">
            {format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMMM d')} - 
            {format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), ' MMMM d, yyyy')}
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'workweek' | 'fullweek')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workweek">Work Week</SelectItem>
                <SelectItem value="fullweek">Full Week</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <span>Timezone</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setTimezone('local')}>Local Time</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTimezone('est')}>Eastern Time</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTimezone('pacific')}>Pacific Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-hidden">
        <div className="week-container relative h-full overflow-hidden">
          <div 
            className="days-header flex border-b"
            style={{ paddingLeft: TIME_COL_WIDTH + 'px' }}
          >
            {renderDaysHeader()}
          </div>

          <div 
            className="timeslots-container relative h-full overflow-y-auto"
            ref={containerRef}
          >
            <div className="flex relative">
              <div 
                className="time-column sticky left-0 bg-white z-10 flex flex-col border-r"
                style={{ width: TIME_COL_WIDTH + 'px' }}
              >
                {renderTimeSlots()}
              </div>
              <div className="days-grid flex flex-1 relative">
                {renderEvents()}
              </div>
            </div>

            {/* Current time indicator */}
            <div 
              className="current-time absolute left-0 right-0 border-t border-red-500 z-20"
              style={{ 
                top: currentTimePosition + 'px',
                display: showCurrentTimeIndicator ? 'block' : 'none'
              }}
            >
              <div className="absolute -left-1 -top-2 w-3 h-3 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWeekView;
