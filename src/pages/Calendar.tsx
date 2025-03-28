
import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

export default function Calendar() {
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calendarDialogMode, setCalendarDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarType | null>(null);
  
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    selectedEvent,
    modalOpen,
    setModalOpen,
    modalMode,
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p>Loading calendar data...</p>
        </div>
      </div>
    );
  }
  
  if (myCalendars.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-md p-4">
          <h2 className="text-xl font-medium mb-2">No calendars found</h2>
          <p className="text-gray-500 mb-4">
            You don't have any calendars yet. Create your first calendar to get started.
          </p>
          <button 
            onClick={createCalendarWrapper}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Create Calendar
          </button>
        </div>
      </div>
    );
  }
  
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
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CalendarMain
            view={currentView}
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleDayClick}
          />
        </div>
        
        <div className="w-64 border-l border-gray-200 flex-shrink-0 bg-white overflow-hidden">
          <CalendarSidebar
            myCalendars={myCalendars}
            otherCalendars={otherCalendars}
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
        myCalendars={myCalendars}
        otherCalendars={otherCalendars}
      />
      
      <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <CalendarManagement
            myCalendars={myCalendars}
            otherCalendars={otherCalendars}
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
