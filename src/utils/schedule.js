
import {
  addDays,
  isWeekend,
  startOfDay,
  parseISO,
  eachDayOfInterval
} from 'date-fns';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Helper to check if a date is a weekend or a holiday.
const isWorkDay = (date, holidays) => {
  if (isWeekend(date)) return false;
  const dateWithoutTime = startOfDay(date);
  return !holidays.some(h => startOfDay(h).getTime() === dateWithoutTime.getTime());
};

// Helper to count the number of workdays between two dates, inclusive.
const countWorkDays = (start, end, holidays) => {
  if (start > end) return 0;
  const interval = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
  return interval.filter(day => isWorkDay(day, holidays)).length;
}

// Helper to check if a participant is marked as absent for a given date.
const isAbsent = (participant, date, absences) => {
  if (!participant) return true; // A non-existent participant is always "absent".
  const today = startOfDay(date);
  return absences.some(absence => {
    const startDate = startOfDay(absence.startDate);
    const endDate = startOfDay(absence.endDate);
    return absence.participantId === participant.id && today >= startDate && today <= endDate;
  });
};

export const generateSchedule = async (participants, holidays, daysToGenerate, anchorDate) => {
  if (!participants || participants.length === 0) return [];

  // Fetch all absence records from Firestore.
  const absencesSnapshot = await getDocs(collection(db, 'absences'));
  const absences = absencesSnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, startDate: parseISO(data.startDate), endDate: parseISO(data.endDate) };
  });

  const schedule = [];
  let currentDate = new Date();

  // Generate the schedule day by day until we have the desired number of entries.
  while (schedule.length < daysToGenerate) {
    if (isWorkDay(currentDate, holidays)) {
      // 1. Calculate the "ideal" person for today based on a fair rotation since the anchor date.
      const workDaysPassed = countWorkDays(anchorDate, currentDate, holidays);
      const idealIndex = (workDaysPassed - 1) % participants.length;

      const previousResponsible = schedule.length > 0 ? schedule[schedule.length - 1].responsible : null;
      let responsible = null;

      // 2. Find the first available person who is NOT a duplicate of yesterday.
      // We start searching from the "ideal" person for today's turn.
      for (let i = 0; i < participants.length; i++) {
        const participantIndex = (idealIndex + i) % participants.length;
        const candidate = participants[participantIndex];
        
        const isDuplicate = previousResponsible && previousResponsible.id === candidate.id;

        if (!isAbsent(candidate, currentDate, absences) && !isDuplicate) {
          responsible = candidate; // Found a valid person.
          break;
        }
      }
      
      // 3. Last Resort: If `responsible` is still null, it means the only available people
      // were duplicates. In this case, we MUST assign a duplicate to avoid an empty day.
      // We find the first available person, ignoring the duplicate check.
      if (responsible === null) {
          for (let i = 0; i < participants.length; i++) {
              const participantIndex = (idealIndex + i) % participants.length;
              const candidate = participants[participantIndex];
              if (!isAbsent(candidate, currentDate, absences)) {
                  responsible = candidate;
                  break;
              }
          }
      }

      schedule.push({ date: currentDate, responsible });
    }
    currentDate = addDays(currentDate, 1);
  }

  return schedule;
};
