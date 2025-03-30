import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { X, Users, MapPin, Clock, CalendarClock, Bell, FileText, Briefcase, Scale, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from '@/components/ui/separator';
import { CalendarEvent } from '@/types/calendar';
import { useCalendar } from '@/hooks/useCalendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

export function EventModal({ isOpen, onClose, event, mode, onSave, onDelete }: EventModalProps) {
  // Get calendars from the useCalendar hook
  const { myCalendars } = useCalendar();
  
  // Create defaultEvent with a valid calendar ID from myCalendars
  const getDefaultCalendarId = () => {
    if (!myCalendars || myCalendars.length === 0) {
      console.error('No calendars available for event creation');
      return '';
    }
    return myCalendars[0].id;
  };
  
  const defaultEvent: CalendarEvent = {
    id: Math.random().toString(36).substring(2, 9),
    title: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000), // 30 minutes later
    type: 'client-meeting',
    calendar: getDefaultCalendarId(),
    description: '',
    location: '',
    attendees: [],
    isRecurring: false,
    reminder: '15min',
    isAllDay: false,
    caseId: '',
    clientName: '',
    assignedLawyer: '',
    courtInfo: {
      courtName: '',
      judgeDetails: '',
      docketNumber: ''
    },
    documents: []
  };
  
  const [formData, setFormData] = useState<CalendarEvent>(event || defaultEvent);
  const [activeTab, setActiveTab] = useState('general');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [editMode, setEditMode] = useState(mode !== 'view');
  const [recurrenceOption, setRecurrenceOption] = useState('none');
  
  useEffect(() => {
    if (event) {
      setFormData(event);
      setEditMode(mode !== 'view');
      
      if (event.isRecurring && event.recurrencePattern) {
        setRecurrenceOption(event.recurrencePattern.frequency || 'none');
      } else {
        setRecurrenceOption('none');
      }
      
      console.log("Event loaded in modal:", event);
      if (event.isRecurring) {
        console.log("Recurrence pattern:", event.recurrencePattern);
      }
    } else {
      // Make sure we're using a valid calendar ID from myCalendars
      const updatedDefaultEvent = {
        ...defaultEvent,
        calendar: getDefaultCalendarId()
      };
      setFormData(updatedDefaultEvent);
      setEditMode(mode !== 'view');
      setRecurrenceOption('none');
    }
    
    setActiveTab('general');
  }, [event, mode, isOpen, myCalendars]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateTimeChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: new Date(value) 
    }));
  };
  
  const handleAllDayChange = (checked: boolean) => {
    setFormData(prev => {
      const newStart = new Date(prev.start);
      const newEnd = new Date(prev.end);
      
      if (checked) {
        newStart.setHours(0, 0, 0, 0);
        newEnd.setHours(23, 59, 59, 999);
      }
      
      return {
        ...prev,
        isAllDay: checked,
        start: newStart,
        end: newEnd
      };
    });
  };
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };
  
  const handleRemoveAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddDocument = () => {
    if (documentName.trim() && documentUrl.trim()) {
      const newDocument = {
        id: Math.random().toString(36).substring(2, 9),
        name: documentName.trim(),
        url: documentUrl.trim()
      };
      
      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), newDocument]
      }));
      
      setDocumentName('');
      setDocumentUrl('');
    }
  };
  
  const handleRemoveDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter(doc => doc.id !== id)
    }));
  };
  
  const handleCourtInfoChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courtInfo: {
        ...(prev.courtInfo || {}),
        [name]: value
      }
    }));
  };
  
  const handleRecurrenceChange = (option: string) => {
    setRecurrenceOption(option);
    
    if (option === 'none') {
      setFormData(prev => ({
        ...prev,
        isRecurring: false,
        recurrencePattern: undefined
      }));
    } else {
      setFormData(prev => {
        let pattern = prev.recurrencePattern || {
          frequency: 'daily',
          interval: 1
        };
        
        pattern = { 
          ...pattern, 
          frequency: option as 'daily' | 'weekly' | 'monthly' | 'yearly'
        };
        
        console.log("Setting recurrence pattern:", pattern);
        
        return {
          ...prev,
          isRecurring: true,
          recurrencePattern: pattern
        };
      });
    }
  };
  
  const handleRecurrenceIntervalChange = (value: string) => {
    const interval = parseInt(value);
    if (!isNaN(interval) && interval > 0) {
      setFormData(prev => ({
        ...prev,
        recurrencePattern: {
          ...(prev.recurrencePattern || { frequency: 'daily', interval: 1 }),
          interval: interval
        }
      }));
    }
  };
  
  const handleRecurrenceEndChange = (type: string, value?: string) => {
    setFormData(prev => {
      let pattern = { ...(prev.recurrencePattern || { frequency: 'daily', interval: 1 }) };
      
      if (type === 'never') {
        delete pattern.endDate;
        delete pattern.occurrences;
      } else if (type === 'on_date' && value) {
        pattern.endDate = new Date(value);
        delete pattern.occurrences;
      } else if (type === 'after_occurrences' && value) {
        pattern.occurrences = parseInt(value);
        delete pattern.endDate;
      }
      
      return {
        ...prev,
        recurrencePattern: pattern
      };
    });
  };
  
  const handleSwitchToEdit = () => {
    setEditMode(true);
  };
  
  const handleSave = () => {
    // Print calendar ID being saved for debugging
    console.log("Saving event with calendar ID:", formData.calendar);
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && formData.id) {
      onDelete(formData.id);
      onClose();
    }
  };
  
  const isViewOnly = !editMode;
  
  // Helper function to get calendar name from ID
  const getCalendarNameById = (id: string) => {
    if (!myCalendars) return 'Unknown Calendar';
    const calendar = myCalendars.find(cal => cal.id === id);
    return calendar ? calendar.name : 'Unknown Calendar';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="bg-yorpro-600 text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {editMode ? (mode === 'create' ? 'Create Event' : 'Edit Event') : formData.title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-yorpro-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {isViewOnly && (
            <div className="text-sm opacity-90 mt-1">
              {format(formData.start, 'EEEE, MMMM d, yyyy')}
            </div>
          )}
        </div>
        
        <div className="h-[70vh] overflow-hidden flex flex-col">
          {!isViewOnly ? (
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <div className="px-6 pt-4 border-b">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="legal">Legal Details</TabsTrigger>
                  <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="general" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Event title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isAllDay" className="cursor-pointer">All-day event</Label>
                    <Switch 
                      id="isAllDay" 
                      checked={formData.isAllDay} 
                      onCheckedChange={handleAllDayChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start</Label>
                      <Input
                        type={formData.isAllDay ? "date" : "datetime-local"}
                        name="start"
                        value={format(formData.start, formData.isAllDay ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => handleDateTimeChange('start', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>End</Label>
                      <Input
                        type={formData.isAllDay ? "date" : "datetime-local"}
                        name="end"
                        value={format(formData.end, formData.isAllDay ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => handleDateTimeChange('end', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      placeholder="Add location"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Add description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger className="mt-1">
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
                    
                    <div>
                      <Label>Calendar</Label>
                      <Select
                        value={formData.calendar}
                        onValueChange={(value) => handleSelectChange('calendar', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select calendar" />
                        </SelectTrigger>
                        <SelectContent>
                          {myCalendars.map((calendar) => (
                            <SelectItem key={calendar.id} value={calendar.id}>
                              {calendar.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Reminder</Label>
                    <Select
                      value={formData.reminder}
                      onValueChange={(value) => handleSelectChange('reminder', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Set reminder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="5min">5 minutes before</SelectItem>
                        <SelectItem value="15min">15 minutes before</SelectItem>
                        <SelectItem value="30min">30 minutes before</SelectItem>
                        <SelectItem value="1hour">1 hour before</SelectItem>
                        <SelectItem value="1day">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Attendees</Label>
                    <div className="flex mt-1 gap-2">
                      <Input
                        value={attendeeInput}
                        onChange={(e) => setAttendeeInput(e.target.value)}
                        placeholder="Add attendee name or email"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAttendee()}
                      />
                      <Button type="button" onClick={handleAddAttendee}>Add</Button>
                    </div>
                    
                    {formData.attendees && formData.attendees.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.attendees.map((attendee, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {attendee}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveAttendee(idx)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="legal" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="caseId">Case ID</Label>
                    <Input
                      id="caseId"
                      name="caseId"
                      value={formData.caseId || ''}
                      onChange={handleChange}
                      placeholder="Case reference number"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      value={formData.clientName || ''}
                      onChange={handleChange}
                      placeholder="Client name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedLawyer">Assigned Lawyer</Label>
                    <Input
                      id="assignedLawyer"
                      name="assignedLawyer"
                      value={formData.assignedLawyer || ''}
                      onChange={handleChange}
                      placeholder="Lawyer name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-3">Court Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="courtName">Court Name</Label>
                        <Input
                          id="courtName"
                          value={formData.courtInfo?.courtName || ''}
                          onChange={(e) => handleCourtInfoChange('courtName', e.target.value)}
                          placeholder="Court name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="judgeDetails">Judge Details</Label>
                        <Input
                          id="judgeDetails"
                          value={formData.courtInfo?.judgeDetails || ''}
                          onChange={(e) => handleCourtInfoChange('judgeDetails', e.target.value)}
                          placeholder="Judge name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="docketNumber">Docket Number</Label>
                        <Input
                          id="docketNumber"
                          value={formData.courtInfo?.docketNumber || ''}
                          onChange={(e) => handleCourtInfoChange('docketNumber', e.target.value)}
                          placeholder="Docket number"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recurrence" className="space-y-4 mt-0">
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-3">Recurrence Pattern</h3>
                    
                    <RadioGroup 
                      value={recurrenceOption} 
                      onValueChange={handleRecurrenceChange}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="r-none" />
                        <Label htmlFor="r-none">Does not repeat</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="r-daily" />
                        <Label htmlFor="r-daily">Daily</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="r-weekly" />
                        <Label htmlFor="r-weekly">Weekly</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="r-monthly" />
                        <Label htmlFor="r-monthly">Monthly</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="r-yearly" />
                        <Label htmlFor="r-yearly">Yearly</Label>
                      </div>
                    </RadioGroup>
                    
                    {recurrenceOption !== 'none' && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="interval">Repeat every</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              id="interval"
                              type="number"
                              min="1"
                              value={formData.recurrencePattern?.interval || 1}
                              onChange={(e) => handleRecurrenceIntervalChange(e.target.value)}
                              className="w-20"
                            />
                            <span>{recurrenceOption === 'daily' ? 'day(s)' : 
                                    recurrenceOption === 'weekly' ? 'week(s)' :
                                    recurrenceOption === 'monthly' ? 'month(s)' : 'year(s)'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>End recurrence</Label>
                          <div className="space-y-2 mt-1">
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                id="end-never" 
                                name="end-recurrence"
                                checked={!formData.recurrencePattern?.endDate && !formData.recurrencePattern?.occurrences}
                                onChange={() => handleRecurrenceEndChange('never')}
                              />
                              <Label htmlFor="end-never" className="cursor-pointer">Never</Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                id="end-date" 
                                name="end-recurrence"
                                checked={!!formData.recurrencePattern?.endDate}
                                onChange={() => {
                                  const defaultEndDate = addDays(new Date(), 30);
                                  handleRecurrenceEndChange('on_date', format(defaultEndDate, 'yyyy-MM-dd'));
                                }}
                              />
                              <Label htmlFor="end-date" className="cursor-pointer">On date</Label>
                              {formData.recurrencePattern?.endDate && (
                                <Input
                                  type="date"
                                  value={format(formData.recurrencePattern.endDate, 'yyyy-MM-dd')}
                                  onChange={(e) => handleRecurrenceEndChange('on_date', e.target.value)}
                                  className="w-auto"
                                />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                id="end-occurrences" 
                                name="end-recurrence"
                                checked={!!formData.recurrencePattern?.occurrences}
                                onChange={() => handleRecurrenceEndChange('after_occurrences', '10')}
                              />
                              <Label htmlFor="end-occurrences" className="cursor-pointer">After</Label>
                              {formData.recurrencePattern?.occurrences && (
                                <Input
                                  type="number"
                                  min="1"
                                  value={formData.recurrencePattern.occurrences}
                                  onChange={(e) => handleRecurrenceEndChange('after_occurrences', e.target.value)}
                                  className="w-20"
                                />
                              )}
                              <span>occurrences</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4 mt-0">
                  <div>
                    <h3 className="font-medium mb-3">Linked Documents</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <Label htmlFor="documentName">Document Name</Label>
                          <Input
                            id="documentName"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Document name"
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor="documentUrl">URL</Label>
                          <div className="flex mt-1 gap-2">
                            <Input
                              id="documentUrl"
                              value={documentUrl}
                              onChange={(e) => setDocumentUrl(e.target.value)}
                              placeholder="URL to document"
                            />
                            <Button 
                              type="button" 
                              onClick={handleAddDocument}
                              disabled={!documentName.trim() || !documentUrl.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {(!formData.documents || formData.documents.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>No documents linked to this event</p>
                          <p className="text-sm">Add documents using the form above</p>
                        </div>
                      )}
                      
                      {formData.documents && formData.documents.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {formData.documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>{doc.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                  View
                                </a>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
              
              <DialogFooter className="bg-gray-50 p-4 mt-auto">
                <div className="flex w-full justify-between">
                  {mode === 'edit' && (
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  )}
                  <div className={`space-x-2 ${mode === 'create' ? 'ml-auto' : ''}`}>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {mode === 'create' ? 'Create' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </Tabs>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col space-y-8">
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-gray-700">
                        {formData.isAllDay ? "All day event" : 
                          `${format(formData.start, 'h:mm a')} - ${format(formData.end, 'h:mm a')}`}
                      </div>
                    </div>
                  </div>
                  
                  {formData.location && (
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-gray-700">{formData.location}</div>
                      </div>
                    </div>
                  )}
                  
                  {formData.description && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="font-medium mb-2">Description</div>
                      <div className="text-gray-700 whitespace-pre-line">{formData.description}</div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <CalendarClock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Calendar</div>
                      <div className="text-gray-700">
                        {getCalendarNameById(formData.calendar)}
                      </div>
                    </div>
                  </div>
                  
                  {formData.attendees && formData.attendees.length > 0 && (
                    <div className="flex items-start gap-4">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Attendees</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.attendees.map((attendee, idx) => (
                            <Badge key={idx} variant="outline">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.reminder && formData.reminder !== 'none' && (
                    <div className="flex items-start gap-4">
                      <Bell className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Reminder</div>
                        <div className="text-gray-700">
                          {formData.reminder === '5min' ? '5 minutes before' :
                           formData.reminder === '15min' ? '15 minutes before' :
                           formData.reminder === '30min' ? '30 minutes before' :
                           formData.reminder === '1hour' ? '1 hour before' :
                           '1 day before'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.isRecurring && formData.recurrencePattern && (
                    <div className="flex items-start gap-4">
                      <CalendarClock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Recurring Event</div>
                        <div className="text-gray-700">
                          Repeats every {formData.recurrencePattern.interval || 1} {
                            formData.recurrencePattern.frequency === 'daily' ? 'day(s)' : 
                            formData.recurrencePattern.frequency === 'weekly' ? 'week(s)' :
                            formData.recurrencePattern.frequency === 'monthly' ? 'month(s)' : 
                            formData.recurrencePattern.frequency === 'yearly' ? 'year(s)' : ''
                          }
                          {formData.recurrencePattern.endDate && 
                            ` until ${format(new Date(formData.recurrencePattern.endDate), 'MMMM d, yyyy')}`}
                          {formData.recurrencePattern.occurrences &&
                            ` for ${formData.recurrencePattern.occurrences} occurrences`}
                          {!formData.recurrencePattern.endDate && !formData.recurrencePattern.occurrences &&
                            ` (no end date)`}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(formData.caseId || formData.clientName || formData.assignedLawyer) && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-medium mb-3">Legal Details</h3>
                      
                      <div className="space-y-4">
                        {formData.caseId && (
                          <div className="flex items-start gap-4">
                            <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="font-medium">Case ID</div>
                              <div className="text-gray-700">{formData.caseId}</div>
                            </div>
                          </div>
                        )}
                        
                        {formData.clientName && (
                          <div className="flex items-start gap-4">
                            <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="font-medium">Client</div>
                              <div className="text-gray-700">{formData.clientName}</div>
                            </div>
                          </div>
                        )}
                        
                        {formData.assignedLawyer && (
                          <div className="flex items-start gap-4">
                            <Scale className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <div className="font-medium">Assigned Lawyer</div>
                              <div className="text-gray-700">{formData.assignedLawyer}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {formData.courtInfo && (formData.courtInfo.courtName || formData.courtInfo.judgeDetails || formData.courtInfo.docketNumber) && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-medium mb-3">Court Information</h3>
