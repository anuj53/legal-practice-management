
import React, { useState } from 'react';
import { addDays, format, startOfDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader, type CalendarView } from '@/components/calendar/CalendarHeader';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { EventModal } from '@/components/calendar/EventModal';
import { useCalendarData, type Event } from '@/hooks/useCalendarData';
import { toast } from 'sonner';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const {
    myCalendars,
    otherCalendars,
    events,
    loading,
    updateCalendar,
    createCalendar,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendarData();
  
  // Filter events based on selected calendars
  const filteredEvents = events.filter(event => {
    const allCalendars = [...myCalendars, ...otherCalendars];
    const calendar = allCalendars.find(cal => cal.id === event.calendar);
    return calendar?.checked;
  });
  
  const handleCalendarToggle = (id: string, category: 'my' | 'other') => {
    if (category === 'my') {
      const calendar = myCalendars.find(cal => cal.id === id);
      if (calendar) {
        updateCalendar({
          ...calendar,
          checked: !calendar.checked
        });
      }
    } else {
      const calendar = otherCalendars.find(cal => cal.id === id);
      if (calendar) {
        const updatedCalendar = {
          ...calendar,
          checked: !calendar.checked
        };
        updateCalendar(updatedCalendar);
      }
    }
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setModalOpen(true);
  };
  
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };
  
  const handleCreateEvent = () => {
    console.log("Create event clicked");
    // Create a default event starting at the current time
    const now = new Date();
    const defaultEvent = {
      id: '',  // Empty ID for new events
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
      type: 'client-meeting' as const,
      calendar: myCalendars[0]?.id || 'personal',
      isAllDay: false
    };
    
    setSelectedEvent(defaultEvent as Event);
    setModalMode('create');
    setModalOpen(true);
  };
  
  const handleSaveEvent = async (event: Event) => {
    console.log("Saving event:", event);
    try {
      if (modalMode === 'create') {
        console.log("Creating new event");
        const newEvent = await createEvent(event);
        toast.success('Event created successfully!');
        console.log("New event created:", newEvent);
      } else {
        console.log("Updating event");
        const updatedEvent = await updateEvent(event);
        toast.success('Event updated successfully!');
        console.log("Event updated:", updatedEvent);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    console.log("Deleting event:", id);
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully!');
      setModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
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
        <div className="flex-1 overflow-hidden">
          {currentView === 'day' && (
            <DayView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
          {currentView === 'week' && (
            <WeekView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
          {currentView === 'month' && (
            <MonthView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === 'agenda' && (
            <AgendaView
              date={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>
        
        {/* Sidebar */}
        <CalendarSidebar
          myCalendars={myCalendars}
          otherCalendars={otherCalendars}
          onCalendarToggle={handleCalendarToggle}
          onCreateEvent={handleCreateEvent}
        />
      </div>
      
      {/* Floating new event button - visible in mobile when sidebar is hidden */}
      <div className="md:hidden fixed right-4 bottom-4">
        <Button 
          onClick={handleCreateEvent}
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-yorpro-600 hover:bg-yorpro-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
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
