
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
import { useIsMobile } from '@/hooks/use-mobile';

export default function Calendar() {
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calendarDialogMode, setCalendarDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarType | null>(null);
  const [session, setSession] = useState(null);
  const [showFullDay, setShowFullDay] = useState(true);
  const isMobile = useIsMobile();
  
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
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Set up auth state change subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
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
    return (
      <div className="flex items-center justify-center h-full">
        <AuthForm />
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-8 rounded-lg bg-white shadow-lg border border-yorpro-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-yorpro-600 border-yorpro-100 animate-spin mb-4"></div>
            <p className="text-yorpro-700 font-medium">Loading calendar data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="flex-shrink-0 px-2 sm:px-4 pt-2 sm:pt-4">
        <CalendarHeader
          currentDate={currentDate}
          view={currentView}
          onViewChange={setCurrentView}
          onDateChange={setCurrentDate}
          onCreateEvent={handleCreateEvent}
          onCreateCalendar={createCalendarWrapper}
          showFullDay={showFullDay}
          onToggleFullDay={setShowFullDay}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="flex-1 overflow-hidden relative bg-white rounded-lg shadow-md border border-gray-100">
          <CalendarMain
            view={currentView}
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
            onCreateEvent={handleTimeSlotSelect}
            showFullDay={showFullDay}
            myCalendars={myCalendars || []}
            otherCalendars={otherCalendars || []}
            onCalendarToggle={handleCalendarToggle}
            onEditCalendar={editCalendarWrapper}
          />
        </div>
        
        {!isMobile && (
          <div className="w-72 ml-4 flex-shrink-0 bg-white overflow-hidden rounded-lg shadow-md border border-gray-100 hidden md:block">
            <CalendarSidebar
              myCalendars={myCalendars || []}
              otherCalendars={otherCalendars || []}
              onCalendarToggle={handleCalendarToggle}
              onEditCalendar={editCalendarWrapper}
            />
          </div>
        )}
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
