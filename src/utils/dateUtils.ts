
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO, setHours } from 'date-fns';

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({
    start,
    end: endOfWeek(date, { weekStartsOn: 0 })
  });
};

export const getHours = (): string[] => {
  return [
    '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
    '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
  ];
};

export const getMonthDaysGrid = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const startDate = startOfWeek(firstDay, { weekStartsOn: 0 });
  
  const result: Date[][] = [];
  let week: Date[] = [];
  
  for (let i = 0; i < 42; i++) {
    const day = addDays(startDate, i);
    week.push(day);
    
    if (week.length === 7) {
      result.push(week);
      week = [];
    }
  }
  
  return result;
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Parse string dates from API responses
export const parseDateString = (dateStr: string): Date => {
  return parseISO(dateStr);
};

// Create a time object for a specific hour
export const createTimeForHour = (date: Date, hour: number): Date => {
  return setHours(date, hour);
};
