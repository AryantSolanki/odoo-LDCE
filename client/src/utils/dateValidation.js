/**
 * Utility functions for validating date boundaries across Trips, Stops, and Activities.
 */

export const formatDate = (dateStr, formatStyle = 'short') => {
  if (!dateStr) return '';
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(date.getTime())) return dateStr;

  if (formatStyle === 'full') {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (formatStyle === 'monthDay') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDaysDifference = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Validates trip start and end dates.
 */
export const validateTripDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Both start date and end date are required.' };
  }
  if (new Date(startDate) > new Date(endDate)) {
    return { isValid: false, message: 'Trip end date cannot be earlier than the start date.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates stop dates relative to overall trip dates.
 */
export const validateStopDates = (stopStart, stopEnd, tripStart, tripEnd) => {
  if (!stopStart || !stopEnd) {
    return { isValid: false, message: 'Both stop start date and end date are required.' };
  }
  const sStart = new Date(stopStart);
  const sEnd = new Date(stopEnd);
  const tStart = new Date(tripStart);
  const tEnd = new Date(tripEnd);

  if (sStart > sEnd) {
    return { isValid: false, message: 'Stop end date cannot be earlier than stop start date.' };
  }

  if (tripStart && sStart < tStart) {
    return {
      isValid: false,
      message: `Stop start date (${stopStart}) must be on or after trip start date (${tripStart}).`,
    };
  }

  if (tripEnd && sEnd > tEnd) {
    return {
      isValid: false,
      message: `Stop end date (${stopEnd}) must be on or before trip end date (${tripEnd}).`,
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates activity date relative to stop dates.
 */
export const validateActivityDate = (activityDate, stopStart, stopEnd) => {
  if (!activityDate) {
    return { isValid: false, message: 'Activity date is required.' };
  }
  const aDate = new Date(activityDate);
  const sStart = new Date(stopStart);
  const sEnd = new Date(stopEnd);

  if (aDate < sStart || aDate > sEnd) {
    return {
      isValid: false,
      message: `Activity date (${activityDate}) must be within stop dates (${stopStart} to ${stopEnd}).`,
    };
  }

  return { isValid: true, message: '' };
};
