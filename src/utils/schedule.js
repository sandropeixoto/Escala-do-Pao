
import { 
  addDays, 
  isWeekend, 
  format, 
  eachDayOfInterval, 
  isSameDay, 
  startOfDay 
} from 'date-fns';

const isWorkDay = (date, holidays) => {
  if (isWeekend(date)) return false;
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const isHoliday = holidays.some(h => format(h, 'yyyy-MM-dd') === dateStr);
  
  return !isHoliday;
};

const getResponsibleForDate = (targetDate, participants, holidays, anchorDate) => {
  if (participants.length === 0) return null;

  const daysInterval = eachDayOfInterval({ 
    start: startOfDay(anchorDate), 
    end: startOfDay(targetDate) 
  });

  const totalWorkDaysPassed = daysInterval.filter(day => isWorkDay(day, holidays)).length;

  const index = (totalWorkDaysPassed - 1) % participants.length;
  
  return participants[index >= 0 ? index : 0];
};

export const generateSchedule = (participants, holidays, daysToGenerate = 10, anchorDate = new Date('2024-01-01')) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  const schedule = [];
  let daysFound = 0;
  let currentDate = new Date(); 

  while (daysFound < daysToGenerate) {
    if (isWorkDay(currentDate, holidays)) {
      const responsible = getResponsibleForDate(currentDate, participants, holidays, anchorDate);
      schedule.push({
        date: currentDate,
        responsible
      });
      daysFound++;
    }
    currentDate = addDays(currentDate, 1);
  }
  return schedule;
};
