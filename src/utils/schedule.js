import { addDays, isWeekend, isSameDay } from 'date-fns';

export const getNextBusinessDay = (date, holidays) => {
  let nextDay = addDays(date, 1);
  while (isWeekend(nextDay) || holidays.some(holiday => isSameDay(holiday, nextDay))) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};

export const generateSchedule = (participants, holidays, days = 10) => {
  const schedule = [];
  let currentDate = new Date();

  // Find the last participant and the date of the last schedule entry
  // This is a placeholder, in a real scenario you would fetch this from Firestore
  let lastParticipantIndex = 0;

  for (let i = 0; i < days; i++) {
    const responsible = participants[(lastParticipantIndex + i) % participants.length];
    schedule.push({ date: currentDate, responsible });
    currentDate = getNextBusinessDay(currentDate, holidays);
  }

  return schedule;
};
