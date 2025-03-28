import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CalendarEvent, Calendar as CalendarType, RecurrencePattern } from '@/types/calendar';
import { EventTypeSelect } from './EventTypeSelect';
import { ReminderSelect } from './ReminderSelect';
import { ClientInfoForm } from './ClientInfoForm';
import { CourtInfoForm } from './CourtInfoForm';
import { toast } from 'sonner';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (event: CalendarEvent, recurrencePattern?: RecurrencePattern) => void;
  onDelete: (id: string, recurrenceEditMode?: 'single' | 'future' | 'all') => void;
  myCalendars: CalendarType[];
  otherCalendars: CalendarType[];
}

export function EventModal({
  isOpen,
  onClose,
  event,
  mode,
  onSave,
  onDelete,
  myCalendars,
  otherCalendars
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<CalendarEvent['type']>('client-meeting');
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | undefined>(undefined);
  const [selectedReminder, setSelectedReminder] = useState<CalendarEvent['reminder']>('none');
  const [clientInfo, setClientInfo] = useState<{ caseId?: string; clientName?: string; assignedLawyer?: string }>({});
  const [courtInfo, setCourtInfo] = useState<{ courtName?: string; judgeDetails?: string; docketNumber?: string }>({});
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [recurrenceEditMode, setRecurrenceEditMode] = useState<'single' | 'future' | 'all'>('single');
  
  useEffect(() => {
    if (event) {
      setEventId(event.id);
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartTime(event.start ? new Date(event.start) : undefined);
      setEndTime(event.end ? new Date(event.end) : undefined);
      setSelectedType(event.type || 'client-meeting');
      setSelectedCalendar(event.calendar);
      setIsAllDay(event.isAllDay || false);
      setIsRecurring(event.isRecurring || false);
      setRecurrencePattern(event.recurrencePattern);
      setSelectedReminder(event.reminder || 'none');
      
      // Legal case fields
      setClientInfo({
        caseId: event.caseId,
        clientName: event.clientName,
        assignedLawyer: event.assignedLawyer,
      });
      
      // Court information
      setCourtInfo({
        courtName: event.courtInfo?.courtName,
        judgeDetails: event.courtInfo?.judgeDetails,
        docketNumber: event.courtInfo?.docketNumber,
      });
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      const now = new Date();
      setStartTime(now);
      setEndTime(new Date(now.getTime() + 60 * 60 * 1000));
      setSelectedType('client-meeting');
      setSelectedCalendar(myCalendars.length > 0 ? myCalendars[0].id : '');
      setIsAllDay(false);
      setIsRecurring(false);
      setRecurrencePattern(undefined);
      setSelectedReminder('none');
      setClientInfo({});
      setCourtInfo({});
    }
  }, [event, myCalendars]);
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedCalendar) {
      toast.error("You must select a calendar");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Event title cannot be empty");
      return;
    }
    
    if (!startTime || !endTime) {
      toast.error("Start time and end time are required");
      return;
    }
    
    if (endTime < startTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    console.log("Saving event with calendar ID:", selectedCalendar);
    
    const updatedEvent: CalendarEvent = {
      id: eventId || '',
      title,
      start: startTime,
      end: endTime,
      description,
      location,
      type: selectedType,
      calendar: selectedCalendar,
      isAllDay: isAllDay,
      // Recurrence properties
      isRecurring: isRecurring,
      recurrencePattern: recurrencePattern,
      // Legal case fields
      caseId: clientInfo?.caseId,
      clientName: clientInfo?.clientName,
      assignedLawyer: clientInfo?.assignedLawyer,
      // Court information
      courtInfo: {
        courtName: courtInfo?.courtName,
        judgeDetails: courtInfo?.judgeDetails,
        docketNumber: courtInfo?.docketNumber,
      },
      // Reminder
      reminder: selectedReminder,
    };
    
    console.log("Saving event:", updatedEvent);
    
    if (recurrenceEditMode !== 'single' && updatedEvent.isRecurring) {
      // Handle recurrence edit modes - this would be implemented in onSave
      console.log('Saving with recurrence edit mode:', recurrenceEditMode);
    }
    
    onSave(updatedEvent, recurrencePattern);
  };
  
  const handleDelete = () => {
    if (eventId) {
      onDelete(eventId, recurrenceEditMode);
    }
  };
  
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'View Event' : isEditMode ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {isViewMode ? 'View the details of this event.' : isEditMode ? 'Make changes to your event here. Click save when you\'re done.' : 'Create a new event to add to your calendar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isViewMode}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              disabled={isViewMode}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              disabled={isViewMode}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !startTime && "text-muted-foreground"
                    )}
                    disabled={isViewMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startTime ? format(startTime, "PPP p") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={startTime}
                    onSelect={(date) => setStartTime(date)}
                    disabled={isViewMode}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !endTime && "text-muted-foreground"
                    )}
                    disabled={isViewMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endTime ? format(endTime, "PPP p") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={endTime}
                    onSelect={(date) => setEndTime(date)}
                    disabled={isViewMode}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <EventTypeSelect
              value={selectedType}
              onValueChange={setSelectedType}
              disabled={isViewMode}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calendar" className="text-right">
              Calendar
            </Label>
            <Select onValueChange={setSelectedCalendar} defaultValue={selectedCalendar}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a calendar" />
              </SelectTrigger>
              <SelectContent>
                {[...myCalendars, ...otherCalendars].map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>{calendar.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="all-day" className="text-right">
              All Day
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="all-day"
                checked={isAllDay}
                onCheckedChange={setIsAllDay}
                disabled={isViewMode}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurring" className="text-right">
              Recurring
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                disabled={isViewMode}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder" className="text-right">
              Reminder
            </Label>
            <ReminderSelect
              value={selectedReminder}
              onValueChange={setSelectedReminder}
              disabled={isViewMode}
            />
          </div>
          
          <ClientInfoForm
            clientInfo={clientInfo}
            setClientInfo={setClientInfo}
            disabled={isViewMode}
          />
          
          <CourtInfoForm
            courtInfo={courtInfo}
            setCourtInfo={setCourtInfo}
            disabled={isViewMode}
          />
        </div>
        <DialogFooter>
          {isViewMode ? (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={() => {
                onClose();
                if (event) {
                  onSave({
                    ...event,
                    title,
                    description,
                    location,
                    start: startTime || new Date(),
                    end: endTime || new Date(),
                    type: selectedType,
                    calendar: selectedCalendar,
                    isAllDay,
                    isRecurring,
                    recurrencePattern,
                    caseId: clientInfo?.caseId,
                    clientName: clientInfo?.clientName,
                    assignedLawyer: clientInfo?.assignedLawyer,
                    courtInfo: {
                      courtName: courtInfo?.courtName,
                      judgeDetails: courtInfo?.judgeDetails,
                      docketNumber: courtInfo?.docketNumber,
                    },
                    reminder: selectedReminder,
                  }, recurrencePattern);
                }
              }}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              {isEditMode && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="submit" onClick={handleSubmit}>
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DatePicker() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
