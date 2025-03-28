
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Calendar, CalendarShare } from '@/types/calendar';
import { Button } from '@/components/ui/button';
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
import { CalendarForm } from './CalendarForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface CalendarManagementProps {
  myCalendars: Calendar[];
  otherCalendars: Calendar[];
  onCalendarToggle: (id: string, category: 'my' | 'other') => void;
  onCreateCalendar: (calendar: Omit<Calendar, 'id'>) => void;
  onUpdateCalendar: (calendar: Calendar) => void;
  onDeleteCalendar: (id: string) => void;
  dialogMode?: boolean;
  dialogEditMode?: 'create' | 'edit';
  selectedCalendar?: Calendar | null;
}

export function CalendarManagement({
  myCalendars,
  otherCalendars,
  onCalendarToggle,
  onCreateCalendar,
  onUpdateCalendar,
  onDeleteCalendar,
  dialogMode = false,
  dialogEditMode = 'create',
  selectedCalendar = null
}: CalendarManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | null>(null);
  const [calendarName, setCalendarName] = useState('');
  const [calendarColor, setCalendarColor] = useState('#4caf50');
  const [isFirm, setIsFirm] = useState(false);
  const [isStatute, setIsStatute] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [sharedWith, setSharedWith] = useState<CalendarShare[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Effect for dialog mode
  useEffect(() => {
    if (dialogMode) {
      setEditMode(dialogEditMode);
      
      // If in edit mode and we have a selected calendar
      if (dialogEditMode === 'edit' && selectedCalendar) {
        setCurrentCalendar(selectedCalendar);
        setCalendarName(selectedCalendar.name);
        setCalendarColor(selectedCalendar.color);
        setIsFirm(selectedCalendar.is_firm || false);
        setIsStatute(selectedCalendar.is_statute || false);
        setIsPublic(selectedCalendar.is_public || false);
        setSharedWith(selectedCalendar.sharedWith || []);
      } else {
        // Create mode
        setCurrentCalendar(null);
        setCalendarName('');
        setCalendarColor('#4caf50');
        setIsFirm(false);
        setIsStatute(false);
        setIsPublic(false);
        setSharedWith([]);
      }
    }
  }, [dialogMode, dialogEditMode, selectedCalendar]);
  
  const handleOpenDialog = (mode: 'create' | 'edit', calendar?: Calendar) => {
    setEditMode(mode);
    if (mode === 'edit' && calendar) {
      setCurrentCalendar(calendar);
      setCalendarName(calendar.name);
      setCalendarColor(calendar.color);
      setIsFirm(calendar.is_firm || false);
      setIsStatute(calendar.is_statute || false);
      setIsPublic(calendar.is_public || false);
      setSharedWith(calendar.sharedWith || []);
    } else {
      setCurrentCalendar(null);
      setCalendarName('');
      setCalendarColor('#4caf50');
      setIsFirm(false);
      setIsStatute(false);
      setIsPublic(false);
      setSharedWith([]);
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
        is_public: isPublic,
        sharedWith: sharedWith
      });
      if (!dialogMode) {
        toast.success('Calendar created successfully');
      }
    } else if (currentCalendar) {
      onUpdateCalendar({
        ...currentCalendar,
        name: calendarName,
        color: calendarColor,
        is_firm: isFirm,
        is_statute: isStatute,
        is_public: isPublic,
        sharedWith: sharedWith
      });
      if (!dialogMode) {
        toast.success('Calendar updated successfully');
      }
    }
    
    if (!dialogMode) {
      setIsOpen(false);
    }
  };
  
  const handleDelete = () => {
    if (currentCalendar) {
      onDeleteCalendar(currentCalendar.id);
      setDeleteDialogOpen(false);
      
      if (!dialogMode) {
        setIsOpen(false);
      }
    }
  };
  
  const confirmDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  if (dialogMode) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {dialogEditMode === 'create' ? 'Create New Calendar' : 'Edit Calendar'}
          </DialogTitle>
          <DialogDescription>
            {dialogEditMode === 'create' 
              ? 'Add a new calendar to organize your events'
              : 'Update your calendar details'}
          </DialogDescription>
        </DialogHeader>
        
        <CalendarForm
          calendarName={calendarName}
          setCalendarName={setCalendarName}
          calendarColor={calendarColor}
          setCalendarColor={setCalendarColor}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          isFirm={isFirm}
          setIsFirm={setIsFirm}
          isStatute={isStatute}
          setIsStatute={setIsStatute}
          sharedWith={sharedWith}
          setSharedWith={setSharedWith}
        />
        
        <DialogFooter className={dialogEditMode === 'edit' ? 'justify-between' : 'justify-end'}>
          {dialogEditMode === 'edit' && (
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete Calendar
            </Button>
          )}
          <Button onClick={handleSubmit}>
            {dialogEditMode === 'create' ? 'Create Calendar' : 'Update Calendar'}
          </Button>
        </DialogFooter>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the calendar
                and all events associated with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
  
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
          
          <CalendarForm
            calendarName={calendarName}
            setCalendarName={setCalendarName}
            calendarColor={calendarColor}
            setCalendarColor={setCalendarColor}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            isFirm={isFirm}
            setIsFirm={setIsFirm}
            isStatute={isStatute}
            setIsStatute={setIsStatute}
            sharedWith={sharedWith}
            setSharedWith={setSharedWith}
          />
          
          <DialogFooter className="flex justify-between">
            {editMode === 'edit' && (
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
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
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the calendar
              and all events associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
