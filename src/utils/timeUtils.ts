
// Helper function to round time to the nearest half hour
export const roundToNextHalfHour = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedDate = new Date(date);
  
  if (minutes < 30) {
    // Round to next half hour
    roundedDate.setMinutes(30, 0, 0);
  } else {
    // Round to next hour
    roundedDate.setHours(date.getHours() + 1, 0, 0, 0);
  }
  
  return roundedDate;
};
