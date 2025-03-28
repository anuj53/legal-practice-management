
import React from 'react';
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
    handleCreateCalendar,
  } = useCalendarPage();
  
  // Wrapper function to match the expected signature
  const createCalendarWrapper = () => {
    // Using a dialog/modal to get data and call handleCreateCalendar
    const calendarData = {
      name: "New Calendar",
      color: "#4caf50",
      checked: true,
      isSelected: true,
      isUserCalendar: true,
      is_public: false,
      sharedWith: []
    };
    
    try {
      handleCreateCalendar(calendarData);
      toast.info("Opening calendar creation dialog");
    } catch (error) {
      console.error("Error creating calendar:", error);
      toast.error("Failed to create calendar");
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading calendar data...</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Calendar Header - Fixed at top */}
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
      
      {/* Main content area with sidebar - Both at full height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar Area - This will scroll independently */}
        <div className="flex-1 overflow-hidden">
          <CalendarMain
            view={currentView}
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        </div>
        
        {/* Sidebar - Fixed, not scrolling with calendar content */}
        <div className="w-64 border-l border-gray-200 flex-shrink-0 bg-white overflow-hidden">
          <CalendarSidebar
            myCalendars={myCalendars}
            otherCalendars={otherCalendars}
            onCalendarToggle={handleCalendarToggle}
            onCreateEvent={handleCreateEvent}
          />
        </div>
      </div>
      
      {/* Floating new event button - visible on mobile when sidebar is hidden */}
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
