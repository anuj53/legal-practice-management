
import { useState } from 'react';
import { CalendarViewType } from '@/types/calendar';

export const useCalendarView = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('week');
  
  return {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
  };
};
