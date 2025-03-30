
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Trash, File, Users, RotateCw, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Event } from '@/utils/calendarUtils';
import { format, addHours, setHours, setMinutes, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { RecurrenceDialog } from '@/components/calendar/RecurrenceDialog';
import { RecurrencePattern } from '@/types/calendar';
import { useEventTypes } from '@/hooks/useEventTypes';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function EventModal({ isOpen, onClose, event, mode, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addHours(new Date(), 1));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [eventType, setEventType] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const { eventTypes = [], loading: eventTypesLoading } = useEventTypes();
  
  // Get event type color
  const getEventTypeColor = (typeId: string | undefined) => {
    if (!typeId) return '#6B7280'; // Default gray
    const foundType = eventTypes.find(type => type.id === typeId);
    return foundType?.color || '#6B7280';
  };
  
  useEffect(() => {
    if (event) {
      console.log("EventModal: Received event:", event);
      console.log("EventModal: Event type:", event.type);
      console.log("EventModal: Event type_id:", event.event_type_id);
      
      setTitle(event.title || '');
      setStartDate(new Date(event.start));
      setEndDate(new Date(event.end));
      setStartTime(format(new Date(event.start), 'HH:mm'));
      setEndTime(format(new Date(event.end), 'HH:mm'));
      setLocation(event.location || '');
      setDescription(event.description || '');
      setIsAllDay(event.isAllDay || false);
      setSelectedCalendar(event.calendar || '');
      setIsRecurring(event.isRecurring || false);
      setRecurrencePattern(event.recurrencePattern || null);
      setEventType(event.event_type_id || '');
      
      if (event.event_type_id) {
        console.log("EventModal: Setting event type to:", event.event_type_id);
      }
    }
  }, [event]);
  
  useEffect(() => {
    if (isAllDay) {
      setStartTime('00:00');
      setEndTime('23:59');
    }
  }, [isAllDay]);
  
  const handleSave = () => {
    if (!startDate || !endDate || !selectedCalendar) {
      return;
    }
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    const updatedEvent: Event = {
      id: event?.id || '',
      title,
      start: startDateTime,
      end: endDateTime,
      location,
      description,
      isAllDay,
      type: eventTypes.find(t => t.id === eventType)?.name || 'default',
      event_type_id: eventType,
      calendar: selectedCalendar,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern || undefined : undefined,
      // Preserve other properties
      caseId: event?.caseId,
      clientName: event?.clientName,
      assignedLawyer: event?.assignedLawyer,
      courtInfo: event?.courtInfo,
      documents: event?.documents,
    };
    
    console.log("Saving event with type:", updatedEvent.type);
    console.log("Saving event with type_id:", updatedEvent.event_type_id);
    
    onSave(updatedEvent);
  };
  
  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };
  
  const handleOpenRecurrenceDialog = () => {
    setRecurrenceDialogOpen(true);
  };
  
  const handleCloseRecurrenceDialog = () => {
    setRecurrenceDialogOpen(false);
  };
  
  const handleRecurrenceChange = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    setRecurrenceDialogOpen(false);
  };
  
  const formatRecurrenceText = () => {
    if (!recurrencePattern) return 'Not recurring';
    
    const { frequency, interval } = recurrencePattern;
    let text = `Every `;
    
    if (interval > 1) {
      text += `${interval} `;
    }
    
    switch (frequency) {
      case 'daily':
        text += interval > 1 ? 'days' : 'day';
        break;
      case 'weekly':
        text += interval > 1 ? 'weeks' : 'week';
        break;
      case 'monthly':
        text += interval > 1 ? 'months' : 'month';
        break;
      case 'yearly':
        text += interval > 1 ? 'years' : 'year';
        break;
    }
    
    if (recurrencePattern.endDate) {
      text += ` until ${format(new Date(recurrencePattern.endDate), 'PP')}`;
    } else if (recurrencePattern.occurrences) {
      text += `, ${recurrencePattern.occurrences} times`;
    }
    
    return text;
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          
          {mode === 'view' ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold">{title}</h2>
                  
                  {event?.event_type_id && (
                    <Badge 
                      style={{ 
                        backgroundColor: getEventTypeColor(event.event_type_id),
                        color: 'white'
                      }}
                    >
                      {eventTypes.find(t => t.id === event.event_type_id)?.name || event.type}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {isAllDay ? (
                        format(new Date(event?.start || new Date()), 'PPPP')
                      ) : (
                        <>
                          {format(new Date(event?.start || new Date()), 'PPPP')}
                        </>
                      )}
                    </span>
                  </div>
                  
                  {!isAllDay && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(new Date(event?.start || new Date()), 'h:mm a')} - 
                        {format(new Date(event?.end || new Date()), 'h:mm a')}
                      </span>
                    </div>
                  )}
                  
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{location}</span>
                    </div>
                  )}
                  
                  {isRecurring && recurrencePattern && (
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatRecurrenceText()}</span>
                    </div>
                  )}
                  
                  {event?.caseId && (
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Case: {event.caseId}</span>
                    </div>
                  )}
                  
                  {event?.clientName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Client: {event.clientName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <div className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                    {description}
                  </div>
                </div>
              )}
              
              {event?.courtInfo && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Court Information</h3>
                  <div className="text-sm bg-gray-50 p-3 rounded-md space-y-2">
                    {event.courtInfo.courtName && <div><span className="font-medium">Court:</span> {event.courtInfo.courtName}</div>}
                    {event.courtInfo.judgeDetails && <div><span className="font-medium">Judge:</span> {event.courtInfo.judgeDetails}</div>}
                    {event.courtInfo.docketNumber && <div><span className="font-medium">Docket:</span> {event.courtInfo.docketNumber}</div>}
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(true)} className="text-red-500 hover:text-red-700">
                  Delete
                </Button>
                <Button onClick={() => {
                  onClose();
                  setTimeout(() => {
                    // Edit mode will be set by the parent component
                  }, 100);
                }}>
                  Edit
                </Button>
              </DialogFooter>
            </div>
          ) : (
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
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventType" className="text-right">
                  Event Type
                </Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypesLoading ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="allDay"
                      checked={isAllDay}
                      onCheckedChange={(checked: boolean) => setIsAllDay(checked)}
                    />
                    <Label htmlFor="allDay" className="cursor-pointer">
                      All Day
                    </Label>
                  </div>
                </div>
              </div>
              
              {!isAllDay && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Time
                  </Label>
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="text-xs text-gray-500 mb-1 block">Start</Label>
                      <Input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endTime" className="text-xs text-gray-500 mb-1 block">End</Label>
                      <Input
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
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
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendar" className="text-right">
                  Calendar
                </Label>
                <Input
                  type="text"
                  id="calendar"
                  value={selectedCalendar}
                  onChange={(e) => setSelectedCalendar(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurrence" className="text-right">
                  Recurrence
                </Label>
                <div className="col-span-3 flex items-center justify-between">
                  <Button variant="outline" onClick={handleOpenRecurrenceDialog}>
                    {formatRecurrenceText()}
                  </Button>
                  <Checkbox
                    id="recurrence"
                    checked={isRecurring}
                    onCheckedChange={(checked: boolean) => setIsRecurring(checked)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <RecurrenceDialog
        isOpen={recurrenceDialogOpen}
        onClose={handleCloseRecurrenceDialog}
        onSave={handleRecurrenceChange}
        initialPattern={recurrencePattern}
      />
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
