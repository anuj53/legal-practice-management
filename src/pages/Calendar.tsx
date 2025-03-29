
import React, { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { EventModal } from '@/components/calendar/EventModal';
import { MobileActionButton } from '@/components/calendar/MobileActionButton';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import { toast } from 'sonner';
import { CalendarManagement } from '@/components/calendar/CalendarManagement';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar as CalendarType } from '@/types/calendar';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Calendar() {
  console.log('Calendar page initializing');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calendarDialogMode, setCalendarDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarType | null>(null);
  const [session, setSession] = useState(null);
  const [showFullDay, setShowFullDay] = useState(true); // Add state for full day toggle
  
  console.log('Before calling useCalendarPage hook');
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    selectedEvent,
    setSelectedEvent,
    modalOpen,
    setModalOpen,
    modalMode,
    setModalMode,
    myCalendars,
    otherCalendars,
    events,
    loading,
    handleCalendarToggle,
    handleEventClick,
    handleDayClick,
    handleCreateEvent,
    handleSaveEvent,
    handleDeleteEvent,
    handleCreateCalendar,
    handleUpdateCalendar,
    handleDeleteCalendar,
  } = useCalendarPage();
  console.log('After calling useCalendarPage hook', { myCalendars, otherCalendars, loading });
  
  // Function to handle creating an event from time slot selection
  const handleTimeSlotSelect = (start: Date, end: Date) => {
    console.log("Time slot selected:", start, end);
    // Create default event from selected time slot
    const defaultCalendarId = myCalendars.length > 0 ? myCalendars[0].id : '';
    
    if (!defaultCalendarId) {
      toast.error("Cannot create event: No calendars available");
      return;
    }
    
    const defaultEvent = {
      title: '',
      start: start,
      end: end,
      type: 'client-meeting',
      calendar: defaultCalendarId,
      isAllDay: false,
      description: '',
      location: '',
    } as any; // Type cast to avoid missing property errors
    
    // Set selected event and open modal in create mode
    setSelectedEvent(defaultEvent);
    setModalMode('create');
    setModalOpen(true);
  };
  
  // Check for authentication
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth session:', session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      
      // Set up auth state change subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state changed:', event);
          setSession(newSession);
        }
      );
      
      return () => subscription.unsubscribe();
    };
    
    checkAuth();
  }, []);
  
  const createCalendarWrapper = () => {
    setCalendarDialogMode('create');
    setSelectedCalendar(null);
    setCalendarDialogOpen(true);
  };
  
  const editCalendarWrapper = (calendar: CalendarType) => {
    setCalendarDialogMode('edit');
    setSelectedCalendar(calendar);
    setCalendarDialogOpen(true);
  };
  
  const onCreateCalendar = (calendar: Omit<CalendarType, 'id'>) => {
    try {
      handleCreateCalendar(calendar);
      setCalendarDialogOpen(false);
      toast.success(`Calendar "${calendar.name}" created successfully!`);
    } catch (error) {
      console.error("Error creating calendar:", error);
      toast.error("Failed to create calendar");
    }
  };
  
  const onUpdateCalendar = (calendar: CalendarType) => {
    try {
      handleUpdateCalendar(calendar);
      setCalendarDialogOpen(false);
      toast.success(`Calendar "${calendar.name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating calendar:", error);
      toast.error("Failed to update calendar");
    }
  };
  
  const onDeleteCalendar = (id: string) => {
    try {
      handleDeleteCalendar(id);
      setCalendarDialogOpen(false);
      toast.success("Calendar deleted successfully!");
    } catch (error) {
      console.error("Error deleting calendar:", error);
      toast.error("Failed to delete calendar");
    }
  };
  
  // If not authenticated, show login form
  if (!session) {
    console.log('Not authenticated, showing login form');
    return (
      <div className="flex items-center justify-center h-full">
        <AuthForm />
      </div>
    );
  }
  
  if (loading) {
    console.log('Loading calendar data...');
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading calendar data...</p>
      </div>
    );
  }
  
  console.log('Rendering calendar with data:', { 
    events: events?.length, 
    myCalendars: myCalendars?.length,
    otherCalendars: otherCalendars?.length
  });
  
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <CalendarHeader
          currentDate={currentDate}
          view={currentView}
          onViewChange={setCurrentView}
          onDateChange={setCurrentDate}
          onCreateEvent={handleCreateEvent}
          onCreateCalendar={createCalendarWrapper}
        />
        
        {/* Add the business hours toggle switch */}
        <div className="flex items-center justify-end mb-2 mr-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-full-day" className="text-sm font-medium">
              {showFullDay ? "Full Day View" : "Business Hours Only"}
            </Label>
            <Switch
              id="show-full-day"
              checked={showFullDay}
              onCheckedChange={setShowFullDay}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CalendarMain
            view={currentView}
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
            onCreateEvent={handleTimeSlotSelect}
            showFullDay={showFullDay} // Pass the state to CalendarMain
          />
        </div>
        
        <div className="w-64 border-l border-gray-200 flex-shrink-0 bg-white overflow-hidden">
          <CalendarSidebar
            myCalendars={myCalendars || []}
            otherCalendars={otherCalendars || []}
            onCalendarToggle={handleCalendarToggle}
            onEditCalendar={editCalendarWrapper}
          />
        </div>
      </div>
      
      <MobileActionButton onClick={handleCreateEvent} />
      
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        mode={modalMode}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
      
      <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <CalendarManagement
            myCalendars={myCalendars || []}
            otherCalendars={otherCalendars || []}
            onCalendarToggle={handleCalendarToggle}
            onCreateCalendar={onCreateCalendar}
            onUpdateCalendar={onUpdateCalendar}
            onDeleteCalendar={onDeleteCalendar}
            dialogMode={true}
            dialogEditMode={calendarDialogMode}
            selectedCalendar={selectedCalendar}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
