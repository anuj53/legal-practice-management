import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Calendar } from '@/utils/calendarUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CalendarManagementProps {
  myCalendars: Calendar[];
  otherCalendars: Calendar[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onCreateCalendar: (calendar: Omit<Calendar, 'id'>) => void;
  onUpdateCalendar: (calendar: Calendar) => void;
  onDeleteCalendar: (id: string) => void;
}

export function CalendarManagement({
  myCalendars,
  otherCalendars,
  onCalendarToggle,
  onCreateCalendar,
  onUpdateCalendar,
  onDeleteCalendar
}: CalendarManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [calendarName, setCalendarName] = useState('');
  const [calendarColor, setCalendarColor] = useState('#5cb85c');
  const [isFirm, setIsFirm] = useState(false);
  const [isStatute, setIsStatute] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  
  const handleOpenDialog = (mode: 'create' | 'edit', calendar?: Calendar) => {
    setEditMode(mode);
    if (mode === 'edit' && calendar) {
      setSelectedCalendar(calendar);
      setCalendarName(calendar.name);
      setCalendarColor(calendar.color);
      setIsFirm(calendar.is_firm || false);
      setIsStatute(calendar.is_statute || false);
      setIsPublic(calendar.is_public || false);
    } else {
      setSelectedCalendar(null);
      setCalendarName('');
      setCalendarColor('#5cb85c');
      setIsFirm(false);
      setIsStatute(false);
      setIsPublic(false);
    }
    setIsOpen(true);
  };
  
  const handleSubmit = () => {
    if (!calendarName.trim()) {
      toast.error('Calendar name is required');
      return;
    }
    
    if (editMode === 'create') {
      onCreateCalendar({
        name: calendarName,
        color: calendarColor,
        checked: true,
        is_firm: isFirm,
        is_statute: isStatute,
        is_public: isPublic
      });
      toast.success('Calendar created successfully');
    } else if (selectedCalendar) {
      onUpdateCalendar({
        ...selectedCalendar,
        name: calendarName,
        color: calendarColor,
        is_firm: isFirm,
        is_statute: isStatute,
        is_public: isPublic
      });
      toast.success('Calendar updated successfully');
    }
    
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    if (selectedCalendar) {
      onDeleteCalendar(selectedCalendar.id);
      toast.success('Calendar deleted successfully');
      setIsOpen(false);
    }
  };
  
  const availableColors = [
    '#5cb85c', // Green
    '#0e91e3', // Blue
    '#d9534f', // Red
    '#f0ad4e', // Orange
    '#905ac7', // Purple
    '#17a2b8', // Teal
    '#fd7e14', // Deep Orange
    '#343a40', // Dark Gray
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Calendars</h3>
        <Button 
          size="sm" 
          onClick={() => handleOpenDialog('create')}
          variant="outline"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New Calendar
        </Button>
      </div>
      
      {/* My Calendars */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">My Calendars</h4>
        <div className="space-y-2">
          {myCalendars.map(calendar => (
            <div key={calendar.id} className="flex items-center justify-between group">
              <div className="flex items-center">
                <div 
                  onClick={() => onCalendarToggle(calendar.id, 'my')}
                  className={cn(
                    "w-4 h-4 rounded mr-2 cursor-pointer border",
                    calendar.checked ? "border-transparent" : "border-gray-300"
                  )}
                  style={{ backgroundColor: calendar.checked ? calendar.color : 'transparent' }}
                />
                <span className="text-sm">{calendar.name}</span>
                {calendar.is_firm && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-1">Firm</span>
                )}
                {calendar.is_statute && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 rounded px-1">Statute</span>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7"
                  onClick={() => handleOpenDialog('edit', calendar)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other Calendars */}
      {otherCalendars.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Other Calendars</h4>
          <div className="space-y-2">
            {otherCalendars.map(calendar => (
              <div key={calendar.id} className="flex items-center">
                <div 
                  onClick={() => onCalendarToggle(calendar.id, 'other')}
                  className={cn(
                    "w-4 h-4 rounded mr-2 cursor-pointer border",
                    calendar.checked ? "border-transparent" : "border-gray-300"
                  )}
                  style={{ backgroundColor: calendar.checked ? calendar.color : 'transparent' }}
                />
                <span className="text-sm">{calendar.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Calendar Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode === 'create' ? 'Create New Calendar' : 'Edit Calendar'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'create' 
                ? 'Add a new calendar to organize your events' 
                : 'Update your calendar settings'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar Name</label>
              <Input 
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                placeholder="Enter calendar name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar Color</label>
              <div className="flex gap-2">
                {availableColors.map(color => (
                  <div 
                    key={color} 
                    onClick={() => setCalendarColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full cursor-pointer",
                      calendarColor === color && "ring-2 ring-offset-2 ring-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Firm Calendar</label>
                <Switch checked={isFirm} onCheckedChange={setIsFirm} />
              </div>
              <p className="text-xs text-gray-500">Official firm calendars are visible to all team members.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Statute Calendar</label>
                <Switch checked={isStatute} onCheckedChange={setIsStatute} />
              </div>
              <p className="text-xs text-gray-500">Use for statute of limitations and important deadlines.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Public Calendar</label>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <p className="text-xs text-gray-500">Make this calendar visible to other team members.</p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {editMode === 'edit' && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="mr-auto"
              >
                Delete Calendar
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editMode === 'create' ? 'Create Calendar' : 'Update Calendar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
