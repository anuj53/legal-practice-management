
// This file now serves as a barrel export for calendar utilities
// Import and re-export from specific utility files

export { 
  isValidUUID 
} from './validationUtils';

export { 
  convertDbEventToEvent,
  convertEventToDbEvent 
} from './eventConverters';

export { 
  generateRecurringEventInstances 
} from './recurrenceUtils';

export { 
  generateDemoEvents,
  generateDemoCalendars 
} from './demoDataUtils';

export type { 
  Calendar,
  Event 
} from './calendarTypes';
