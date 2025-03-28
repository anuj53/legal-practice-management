
import React, { useState } from 'react';
import { 
  format, 
  addDays, 
  startOfWeek,
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getMonth,
  getYear
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Event } from '@/utils/calendarUtils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedWeekViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
  onCreateEvent: () => void;
  onDateChange: (date: Date) => void;
  myCalendars: any[];
  otherCalendars: any[];
}

export function EnhancedWeekView({
  date,
  events,
  onEventClick,
  onDayClick,
  onCreateEvent,
  onDateChange,
  myCalendars,
  otherCalendars
}: EnhancedWeekViewProps) {
  // State for mini calendar
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(new Date());
  
  // Get week dates
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Get mini calendar days
  const miniCalendarStart = startOfWeek(miniCalendarMonth, { weekStartsOn: 1 });
  const miniCalendarEnd = addDays(miniCalendarStart, 41); // 6 weeks to ensure we show enough days
  const miniCalendarDays = eachDayOfInterval({ start: miniCalendarStart, end: miniCalendarEnd });
  
  // Get month name for mini calendar
  const miniCalendarMonthName = format(miniCalendarMonth, 'MMMM yyyy');
  
  // For displaying hours in the week view
  const hours = Array.from({ length: 12 }, (_, i) => i + 12); // 12pm to 11pm
  
  // Function to check if an event is on a specific day and hour
  const getEventForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventHour = event.start.getHours();
      return isSameDay(event.start, day) && eventHour === hour;
    });
  };
  
  // Function for getting event background color based on type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'client-meeting':
        return 'bg-orange-500';
      case 'internal-meeting':
        return 'bg-blue-500';
      case 'court':
        return 'bg-purple-500';
      case 'deadline':
        return 'bg-red-500';
      case 'personal':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex p-4">
        {/* Mini calendar */}
        <div className="w-64 bg-white border rounded-md mr-4">
          <div className="flex justify-between items-center p-2 border-b">
            <button 
              onClick={() => setMiniCalendarMonth(subMonths(miniCalendarMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">{miniCalendarMonthName}</span>
            <button 
              onClick={() => setMiniCalendarMonth(addMonths(miniCalendarMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-2">
            <div className="grid grid-cols-7 gap-1">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="text-xs text-center text-gray-500">
                  {day}
                </div>
              ))}
              
              {miniCalendarDays.map(day => {
                const isCurrentMonth = getMonth(day) === getMonth(miniCalendarMonth) && 
                                      getYear(day) === getYear(miniCalendarMonth);
                return (
                  <div 
                    key={day.toString()}
                    onClick={() => onDateChange(day)}
                    className={cn(
                      "text-xs h-7 w-7 flex items-center justify-center rounded-full cursor-pointer",
                      isToday(day) && "bg-yorpro-600 text-white",
                      isSameDay(day, date) && !isToday(day) && "bg-gray-200",
                      !isCurrentMonth && "text-gray-300"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Today's Events</h3>
            <div className="space-y-2">
              {events.filter(event => isToday(event.start)).map(event => (
                <div 
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="p-2 bg-orange-100 rounded text-xs cursor-pointer"
                >
                  <span className="font-medium block">{event.title}</span>
                  <span className="text-gray-500">{format(event.start, 'h:mm a')}</span>
                </div>
              ))}
              {events.filter(event => isToday(event.start)).length === 0 && (
                <p className="text-xs text-gray-500">No events for today</p>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">My Calendar List</h3>
            <div className="space-y-2">
              {myCalendars.map(calendar => (
                <div key={calendar.id} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: calendar.color }}
                  />
                  <span className="text-sm truncate">{calendar.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main week view */}
        <div className="flex-1 bg-white border rounded-md">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDateChange(addDays(weekStart, -7))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="font-medium">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              
              <button 
                onClick={() => onDateChange(addDays(weekStart, 7))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => onDateChange(new Date())}
              >
                Today
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select defaultValue="week">
                <SelectTrigger className="w-30">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Print Calendar</DropdownMenuItem>
                  <DropdownMenuItem>Export Calendar</DropdownMenuItem>
                  <DropdownMenuItem>Calendar Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="p-2">
            <div className="grid grid-cols-8 border-b">
              <div className="col-span-1 p-2 text-center font-medium">
                All Day
              </div>
              {days.map(day => (
                <div 
                  key={day.toString()}
                  className={cn(
                    "col-span-1 p-2 text-center border-l",
                    isToday(day) && "bg-blue-50"
                  )}
                  onClick={() => onDayClick(day)}
                >
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                  <div className={cn(
                    "inline-flex items-center justify-center h-6 w-6 rounded-full",
                    isToday(day) && "bg-yorpro-600 text-white"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hours grid */}
            <div className="grid grid-cols-8 overflow-auto max-h-[calc(100vh-300px)]">
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  <div className="col-span-1 p-2 text-right border-b text-xs font-medium text-gray-500">
                    {hour === 12 ? '12pm' : `${hour % 12}pm`}
                  </div>
                  
                  {days.map(day => {
                    const eventsForThisSlot = getEventForDayAndHour(day, hour);
                    return (
                      <div 
                        key={`${day}-${hour}`}
                        className={cn(
                          "col-span-1 p-1 border-l border-b h-16 relative",
                          isToday(day) && "bg-blue-50/30"
                        )}
                        onClick={() => {
                          const newDate = new Date(day);
                          newDate.setHours(hour, 0, 0, 0);
                          onDayClick(newDate);
                        }}
                      >
                        {eventsForThisSlot.map(event => (
                          <div 
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className={cn(
                              "absolute top-0 left-0 right-0 mx-1 p-1 rounded text-white text-xs cursor-pointer",
                              getEventColor(event.type)
                            )}
                            style={{ height: 'calc(100% - 2px)' }}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-90">
                              {format(event.start, 'h:mm a')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
