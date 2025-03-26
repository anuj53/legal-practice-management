
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
  }, [events]);
  
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
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
