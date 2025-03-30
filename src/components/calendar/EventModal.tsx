
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, Trash2, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import type { Event } from '@/utils/calendarUtils';
import { RecurrenceDialog } from './RecurrenceDialog';
import { RecurrenceFrequency, RecurrencePattern } from '@/types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
  myCalendars?: any[];
}

export function EventModal({ isOpen, onClose, event, mode, onSave, onDelete, myCalendars = [] }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('client-meeting');
  const [calendarId, setCalendarId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | undefined>(undefined);
  
  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setStartTime(event.start ? format(event.start, 'HH:mm') : '');
      setEndTime(event.end ? format(event.end, 'HH:mm') : '');
      setAllDay(event.isAllDay || false);
      setLocation(event.location || '');
      setEventType(event.type || 'client-meeting');
      setCalendarId(event.calendar || '');
      setIsRecurring(event.isRecurring || false);
      setRecurrencePattern(event.recurrencePattern);
      
      console.log("Event modal loaded with calendar ID:", event.calendar);
    } else {
      resetFields();
    }
  }, [event]);
  
  useEffect(() => {
    // If no calendar ID is set and we have calendars, set the first one as default
    if ((!calendarId || calendarId === '') && myCalendars && myCalendars.length > 0) {
      console.log("Setting default calendar ID to:", myCalendars[0].id);
      setCalendarId(myCalendars[0].id);
    }
  }, [calendarId, myCalendars]);
  
  const resetFields = () => {
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('');
    setEndTime('');
    setAllDay(false);
    setLocation('');
    setEventType('client-meeting');
    // Don't reset calendar ID here, it should persist
    setIsRecurring(false);
    setRecurrencePattern(undefined);
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      
      // If end date is before new start date, set end date to start date
      if (endDate && date > endDate) {
        setEndDate(date);
      }
      
      // If no end date, set end date to start date
      if (!endDate) {
        setEndDate(date);
      }
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // Ensure end date is not before start date
      if (startDate && date < startDate) {
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    
    // If end time is before new start time on the same day, adjust end time
    if (startDate && endDate && startDate.toDateString() === endDate.toDateString()) {
      if (e.target.value > endTime) {
        setEndTime(e.target.value);
      }
    }
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };
  
  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked);
    
    if (checked) {
      setStartTime('00:00');
      setEndTime('23:59');
    } else {
      const now = new Date();
      setStartTime(format(now, 'HH:mm'));
      setEndTime(format(new Date(now.getTime() + 60 * 60 * 1000), 'HH:mm'));
    }
  };
  
  const handleCalendarChange = (value: string) => {
    console.log("Calendar changed to:", value);
    setCalendarId(value);
  };
  
  const handleSave = () => {
    if (!startDate || !endDate || !title.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!calendarId) {
      alert('Please select a calendar');
      return;
    }
    
    console.log("Saving event with calendar ID:", calendarId);
    
    // Combine date and time
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000);
    
    if (!allDay) {
      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        start.setHours(hours, minutes);
      }
      
      if (endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        end.setHours(hours, minutes);
      }
    } else {
      // For all-day events, set start to beginning of day and end to end of day
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    
    const updatedEvent: Event = {
      id: event?.id || '',
      title,
      description,
      start,
      end,
      isAllDay: allDay,
      location,
      type: eventType,
      calendar: calendarId,
      isRecurring,
      recurrencePattern
    };
    
    onSave(updatedEvent);
  };
  
  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id);
    }
  };
  
  const handleRecurrencePatternSave = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    setRecurrenceDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? 'Create Event' : isViewMode ? 'View Event' : 'Edit Event'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                disabled={isViewMode}
                placeholder="Add title"
                className={isViewMode ? "bg-muted" : ""}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/2 space-y-2">
                <Label>Start</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                        disabled={isViewMode}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {!allDay && (
                    <Input
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      disabled={isViewMode || allDay}
                      className={cn("w-24", isViewMode && "bg-muted")}
                    />
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-1/2 space-y-2">
                <Label>End</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={isViewMode}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) => (startDate ? date < startDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {!allDay && (
                    <Input
                      type="time"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      disabled={isViewMode || allDay}
                      className={cn("w-24", isViewMode && "bg-muted")}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="all-day" 
                checked={allDay} 
                onCheckedChange={handleAllDayChange}
                disabled={isViewMode}
              />
              <Label htmlFor="all-day">All day</Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="calendar">Calendar</Label>
              <Select 
                value={calendarId} 
                onValueChange={handleCalendarChange}
                disabled={isViewMode}
              >
                <SelectTrigger className={isViewMode ? "bg-muted" : ""}>
                  <SelectValue placeholder="Select a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {myCalendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: calendar.color }}
                        ></div>
                        {calendar.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select 
                value={eventType} 
                onValueChange={setEventType}
                disabled={isViewMode}
              >
                <SelectTrigger className={isViewMode ? "bg-muted" : ""}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-meeting">Client Meeting</SelectItem>
                  <SelectItem value="internal-meeting">Internal Meeting</SelectItem>
                  <SelectItem value="court">Court Appearance</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Add location"
                disabled={isViewMode}
                className={isViewMode ? "bg-muted" : ""}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add description"
                className={cn("resize-none min-h-[100px]", isViewMode && "bg-muted")}
                disabled={isViewMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="recurring" 
                  checked={isRecurring} 
                  onCheckedChange={setIsRecurring}
                  disabled={isViewMode}
                />
                <Label htmlFor="recurring">Recurring Event</Label>
              </div>
              
              {isRecurring && !isViewMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRecurrenceDialogOpen(true)}
                >
                  <CalendarRange className="h-4 w-4 mr-2" />
                  {recurrencePattern ? 'Edit Pattern' : 'Set Pattern'}
                </Button>
              )}
            </div>
            
            {isRecurring && recurrencePattern && (
              <div className="text-sm border rounded-md p-2 bg-muted/50">
                <p className="font-medium">Recurrence: </p>
                <p>
                  {recurrencePattern.frequency === 'DAILY' && 'Every day'}
                  {recurrencePattern.frequency === 'WEEKLY' && `Every ${recurrencePattern.interval || 1} week(s)`}
                  {recurrencePattern.frequency === 'MONTHLY' && `Every ${recurrencePattern.interval || 1} month(s)`}
                  {recurrencePattern.frequency === 'YEARLY' && `Every ${recurrencePattern.interval || 1} year(s)`}
                  
                  {recurrencePattern.occurrences ? ` for ${recurrencePattern.occurrences} occurrences` : ''}
                  {recurrencePattern.endDate ? ` until ${format(new Date(recurrencePattern.endDate), 'PPP')}` : ''}
                  {!recurrencePattern.occurrences && !recurrencePattern.endDate ? ' (no end date)' : ''}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!isViewMode ? (
              <>
                {!isCreateMode && (
                  <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => {
                  // Switch to edit mode
                  onClose();
                  // Here you'd likely want to have a callback to switch to edit mode
                  // Since we're in a view-only component, we can't directly control this
                }}>Edit</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <RecurrenceDialog 
        open={recurrenceDialogOpen}
        onOpenChange={setRecurrenceDialogOpen}
        initialPattern={recurrencePattern}
        onSave={handleRecurrencePatternSave}
      />
    </>
  );
}
