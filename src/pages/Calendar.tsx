
import React, { useEffect } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { EventModal } from '@/components/calendar/EventModal';
import { MobileActionButton } from '@/components/calendar/MobileActionButton';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import { toast } from 'sonner';

export default function Calendar() {
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
    isValidUUID
  } = useCalendarPage();
  
  // Debug log to confirm data is loaded properly
  useEffect(() => {
    console.log("Calendar component rendered with events:", events.length);
    console.log("Available calendars:", 
      [...myCalendars, ...otherCalendars].map(cal => `${cal.id} (${cal.name})`).join(', ')
    );
    
    if (events.length > 0) {
      console.log("First event:", events[0]);
    } else {
      console.log("No events to display");
    }
  }, [events, myCalendars, otherCalendars]);
  
  // Handle save with improved UUID validation
  const handleSaveEventWithValidation = (event: any) => {
    console.log("Validating event before save:", event);
    console.log("Modal mode:", modalMode);
    
    // For new events in create mode, we need to validate the calendar ID but not the event ID
    if (modalMode === 'create') {
      console.log("Creating new event, validating calendar ID only");
      
      if (!event.calendar) {
        console.error("Missing calendar ID for new event");
        toast.error("Cannot save: Missing calendar ID");
        return;
      }
      
      if (!isValidUUID(event.calendar)) {
        console.error("Invalid calendar ID format for new event:", event.calendar);
        toast.error("Cannot save: Invalid calendar ID format");
        return;
      }
      
      // In create mode, we don't need to validate the event ID as it will be generated
      console.log("Calendar ID validation passed, proceeding with create");
      handleSaveEvent(event);
      return;
    }
    
    // For existing events in edit mode, validate both event ID and calendar ID
    if (!event.id) {
      console.error("Missing event ID for update");
      toast.error("Cannot update event: Missing ID");
      return;
    }
    
    console.log("Validating event ID for edit:", event.id);
    if (!isValidUUID(event.id)) {
      console.error("Invalid event ID for updating:", event.id);
      toast.error("Cannot update event: Invalid ID format");
      return;
    }
    
    if (!event.calendar) {
      console.error("Missing calendar ID for event update");
      toast.error("Cannot update event: Missing calendar ID");
      return;
    }
    
    if (!isValidUUID(event.calendar)) {
      console.error("Invalid calendar ID:", event.calendar);
      toast.error("Cannot update event: Invalid calendar ID format");
      return;
    }
    
    console.log("All validation passed, proceeding with update");
    handleSaveEvent(event);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading calendar data...</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={currentView}
        onDateChange={setCurrentDate}
        onViewChange={setCurrentView}
        onCreateEvent={handleCreateEvent}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar Area */}
        <CalendarMain
          view={currentView}
          date={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
        
        {/* Sidebar */}
        <CalendarSidebar
          myCalendars={myCalendars}
          otherCalendars={otherCalendars}
          onCalendarToggle={handleCalendarToggle}
          onCreateEvent={handleCreateEvent}
        />
      </div>
      
      {/* Floating new event button - visible in mobile when sidebar is hidden */}
      <MobileActionButton onClick={handleCreateEvent} />
      
      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        mode={modalMode}
        onSave={handleSaveEventWithValidation}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
