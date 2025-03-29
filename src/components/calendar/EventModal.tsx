
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
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState('basic');
  
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
      resetForm();
    }
  }, [event, myCalendars]);

  const resetForm = () => {
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
    setActiveTab('basic');
  };
  
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{isViewMode ? 'View Event' : isEditMode ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {isViewMode ? 'View the details of this event.' : isEditMode ? 'Make changes to your event here. Click save when you\'re done.' : 'Create a new event to add to your calendar.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="client">Client Info</TabsTrigger>
            <TabsTrigger value="court">Court Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
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
                  placeholder="Event title"
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
                  placeholder="Add details about this event"
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
                  placeholder="Meeting location or URL"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <div className="col-span-3">
                  <EventTypeSelect
                    value={selectedType}
                    onValueChange={setSelectedType}
                    disabled={isViewMode}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendar" className="text-right">
                  Calendar
                </Label>
                <div className="col-span-3">
                  <Select 
                    onValueChange={setSelectedCalendar} 
                    defaultValue={selectedCalendar} 
                    value={selectedCalendar}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a calendar" />
                    </SelectTrigger>
                    <SelectContent>
                      {myCalendars.map((calendar) => (
                        <SelectItem key={calendar.id} value={calendar.id}>
                          <span className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: calendar.color }}
                            />
                            {calendar.name}
                          </span>
                        </SelectItem>
                      ))}
                      {otherCalendars.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Shared Calendars
                          </div>
                          {otherCalendars.map((calendar) => (
                            <SelectItem key={calendar.id} value={calendar.id}>
                              <span className="flex items-center gap-2">
                                <span 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: calendar.color }}
                                />
                                {calendar.name}
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
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
                <Label htmlFor="start-time" className="text-right">
                  Start
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startTime && "text-muted-foreground"
                        )}
                        disabled={isViewMode}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startTime ? format(startTime, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                      <Calendar
                        mode="single"
                        selected={startTime}
                        onSelect={(date) => date && setStartTime(date)}
                        disabled={isViewMode}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {!isAllDay && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "justify-start text-left font-normal",
                            !startTime && "text-muted-foreground"
                          )}
                          disabled={isViewMode}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {startTime ? format(startTime, "p") : <span>Time</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="center" side="bottom">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between gap-2">
                            <Select
                              disabled={isViewMode}
                              value={startTime ? format(startTime, "HH") : "09"}
                              onValueChange={(value) => {
                                if (startTime) {
                                  const newDate = new Date(startTime);
                                  newDate.setHours(parseInt(value, 10));
                                  setStartTime(newDate);
                                }
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-center py-2">:</span>
                            <Select
                              disabled={isViewMode}
                              value={startTime ? format(startTime, "mm") : "00"}
                              onValueChange={(value) => {
                                if (startTime) {
                                  const newDate = new Date(startTime);
                                  newDate.setMinutes(parseInt(value, 10));
                                  setStartTime(newDate);
                                }
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["00", "15", "30", "45"].map((minute) => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="text-right">
                  End
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endTime && "text-muted-foreground"
                        )}
                        disabled={isViewMode}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endTime ? format(endTime, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                      <Calendar
                        mode="single"
                        selected={endTime}
                        onSelect={(date) => date && setEndTime(date)}
                        disabled={isViewMode}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {!isAllDay && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "justify-start text-left font-normal",
                            !endTime && "text-muted-foreground"
                          )}
                          disabled={isViewMode}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {endTime ? format(endTime, "p") : <span>Time</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="center" side="bottom">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between gap-2">
                            <Select
                              disabled={isViewMode}
                              value={endTime ? format(endTime, "HH") : "10"}
                              onValueChange={(value) => {
                                if (endTime) {
                                  const newDate = new Date(endTime);
                                  newDate.setHours(parseInt(value, 10));
                                  setEndTime(newDate);
                                }
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-center py-2">:</span>
                            <Select
                              disabled={isViewMode}
                              value={endTime ? format(endTime, "mm") : "00"}
                              onValueChange={(value) => {
                                if (endTime) {
                                  const newDate = new Date(endTime);
                                  newDate.setMinutes(parseInt(value, 10));
                                  setEndTime(newDate);
                                }
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["00", "15", "30", "45"].map((minute) => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                <div className="col-span-3">
                  <ReminderSelect
                    value={selectedReminder}
                    onValueChange={setSelectedReminder}
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4">
            <ClientInfoForm
              clientInfo={clientInfo}
              setClientInfo={setClientInfo}
              disabled={isViewMode}
            />
          </TabsContent>
          
          <TabsContent value="court" className="space-y-4">
            <CourtInfoForm
              courtInfo={courtInfo}
              setCourtInfo={setCourtInfo}
              disabled={isViewMode}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          {isViewMode ? (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={() => {
                if (event) {
                  const updatedEvent: CalendarEvent = {
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
                  };
                  onClose();
                  onSave(updatedEvent, recurrencePattern);
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
