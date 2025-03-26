
import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Users, MapPin, Clock, CalendarClock, Bell } from 'lucide-react';
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

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'client-meeting' | 'internal-meeting' | 'court' | 'deadline' | 'personal';
  calendar: string;
  description?: string;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  reminder?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (event: Event) => void;
  onDelete?: (id: string) => void;
}

export function EventModal({ isOpen, onClose, event, mode, onSave, onDelete }: EventModalProps) {
  const [formData, setFormData] = useState<Event>(
    event || {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      start: new Date(),
      end: new Date(new Date().getTime() + 30 * 60000), // 30 minutes later
      type: 'client-meeting',
      calendar: 'personal',
      description: '',
      location: '',
      attendees: [],
      isRecurring: false,
      reminder: '15min'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && formData.id) {
      onDelete(formData.id);
      onClose();
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="bg-yorpro-600 text-white py-4 px-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {mode === 'create' ? 'Create Event' : 
               mode === 'edit' ? 'Edit Event' : 
               formData.title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-yorpro-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {isViewMode && (
            <div className="text-sm opacity-90 mt-1">
              {format(formData.start, 'EEEE, MMMM d, yyyy')}
            </div>
          )}
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!isViewMode ? (
            <div className="space-y-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    name="start"
                    value={format(formData.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        start: new Date(e.target.value) 
                      }));
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    name="end"
                    value={format(formData.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        end: new Date(e.target.value) 
                      }));
                    }}
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
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="firm">Firm Calendar</SelectItem>
                      <SelectItem value="statute">Statute of Limitations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Recurring</Label>
                  <Select
                    value={formData.isRecurring ? "yes" : "no"}
                    onValueChange={(value) => {
                      // Here's the fix - convert string to boolean
                      setFormData(prev => ({ 
                        ...prev, 
                        isRecurring: value === "yes" 
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Is recurring?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="attendees">Attendees</Label>
                <Input
                  id="attendees"
                  placeholder="Add attendees (comma separated)"
                  className="mt-1"
                  onBlur={(e) => {
                    const attendeesList = e.target.value
                      .split(',')
                      .map(name => name.trim())
                      .filter(Boolean);
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      attendees: attendeesList 
                    }));
                    
                    e.target.value = '';
                  }}
                />
                
                {formData.attendees && formData.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.attendees.map((attendee, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {attendee}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attendees: prev.attendees?.filter((_, i) => i !== idx)
                            }));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-gray-700">
                    {format(formData.start, 'h:mm a')} - {format(formData.end, 'h:mm a')}
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
                    {formData.calendar === 'personal' ? 'Personal Calendar' : 
                     formData.calendar === 'firm' ? 'Firm Calendar' : 
                     'Statute of Limitations'}
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
              
              {formData.isRecurring && (
                <div className="flex items-start gap-4">
                  <CalendarClock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Recurring Event</div>
                    <div className="text-gray-700">This event repeats</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 p-4">
          {isViewMode ? (
            <div className="flex w-full justify-between">
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Switch to edit mode logic would go here
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
