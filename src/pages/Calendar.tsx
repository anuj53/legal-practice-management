
import React, { useEffect } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { EventModal } from '@/components/calendar/EventModal';
import { MobileActionButton } from '@/components/calendar/MobileActionButton';
import { useCalendarPage } from '@/hooks/useCalendarPage';

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
    handleDeleteEvent
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
  
  // Helper function to verify if an ID is a valid UUID
  const isValidUUID = (id: string): boolean => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  
  // Handle save with UUID validation
  const handleSaveEventWithValidation = (event: any) => {
    console.log("Validating event before save:", event);
    if (modalMode === 'edit' && !isValidUUID(event.id)) {
      console.error("Invalid event ID for updating:", event.id);
      alert("Cannot update event: Invalid ID format");
      return;
    }
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
