
import { Calendar, Event } from './types';

// Helper function to validate UUID format
export const isValidUUID = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    console.log(`UUID validation failed: ${id} is not a valid string`);
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(id);
  console.log(`UUID validation for "${id}": ${isValid}`);
  return isValid;
};

// Calendar-related validation functions could be added here
