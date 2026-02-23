
import {
  addDays,
  isWeekend,
  startOfDay,
  parseISO,
} from 'date-fns';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const isWorkDay = (date, holidays) => {
  if (isWeekend(date)) return false;
  const dateWithoutTime = startOfDay(date);
  return !holidays.some(h => startOfDay(h).getTime() === dateWithoutTime.getTime());
};

const isAbsent = (participant, date, absences) => {
  if (!participant) return true;
  const today = startOfDay(date);
  return absences.some(absence => {
    const startDate = startOfDay(absence.startDate);
    const endDate = startOfDay(absence.endDate);
    return absence.participantId === participant.id && today >= startDate && today <= endDate;
  });
};

/**
 * Fair rotation using a cycle queue + borrow tracking.
 *
 * Each cycle = every participant serves exactly once.
 * Queue tracks who still needs to go. When someone serves, they leave the queue.
 *
 * When the front person is absent and there are no more substitutes left in the
 * queue, we "borrow" from the next cycle. Borrowed participants are tracked in
 * a Set so each person is only borrowed once per absence stretch.
 *
 * When the queue is fully exhausted (including the absent person finally serving),
 * we start a new cycle, but SKIP anyone who was already borrowed — they already
 * served.
 */
export const generateSchedule = async (participants, holidays, daysToGenerate, anchorDate) => {
  if (!participants || participants.length === 0) return [];

  const absencesSnapshot = await getDocs(collection(db, 'absences'));
  const absences = absencesSnapshot.docs.map(doc => {
    const data = doc.data();
    return { ...data, startDate: parseISO(data.startDate), endDate: parseISO(data.endDate) };
  });

  const today = startOfDay(new Date());
  const anchor = startOfDay(anchorDate);

  const getParticipant = (id) => participants.find(p => p.id === id);

  // Build a fresh cycle queue, optionally skipping IDs that were already
  // "borrowed" into the tail end of the previous cycle.
  const newCycleQueue = (skipIds = new Set()) => {
    return participants.map(p => p.id).filter(id => !skipIds.has(id));
  };

  let queue = newCycleQueue();
  let borrowed = new Set(); // tracks IDs borrowed from the next cycle
  let borrowOffset = 0; // rotates through participants for borrowing

  const processDay = (date, prevResponsible) => {
    // Start new cycle if queue is empty
    if (queue.length === 0) {
      // People who were "borrowed" already served — skip them in the new cycle.
      queue = newCycleQueue(borrowed);
      borrowOffset = 0;
      borrowed = new Set();
    }

    const frontId = queue[0];
    const frontParticipant = getParticipant(frontId);

    // Case 1: Front person is available → they serve their turn
    if (frontParticipant && !isAbsent(frontParticipant, date, absences)) {
      queue.shift();
      return frontParticipant;
    }

    // Case 2: Front person is absent. Find substitute from REST of the queue.
    let bestIndex = -1;
    let fallbackIndex = -1;

    for (let i = 1; i < queue.length; i++) {
      const candidate = getParticipant(queue[i]);
      if (candidate && !isAbsent(candidate, date, absences)) {
        if (fallbackIndex === -1) fallbackIndex = i;
        const isDuplicate = prevResponsible && queue[i] === prevResponsible.id;
        if (!isDuplicate) {
          bestIndex = i;
          break;
        }
      }
    }

    const idx = bestIndex !== -1 ? bestIndex : fallbackIndex;
    if (idx !== -1) {
      const sub = getParticipant(queue[idx]);
      queue.splice(idx, 1);
      return sub;
    }

    // Case 3: Everyone remaining in the queue is absent.
    // "Borrow" someone from the next cycle, using borrowOffset to rotate fairly.
    // Each borrowed person is tracked so they won't be re-borrowed or scheduled
    // again when the next cycle starts.
    let borrowBest = null;
    let borrowFallback = null;

    for (let i = 0; i < participants.length; i++) {
      const pIdx = (borrowOffset + i) % participants.length;
      const p = participants[pIdx];

      // Don't borrow someone who is in the current queue (they're still waiting)
      if (queue.includes(p.id)) continue;
      // Don't borrow the same person twice
      if (borrowed.has(p.id)) continue;
      // Don't borrow someone who is absent
      if (isAbsent(p, date, absences)) continue;

      if (!borrowFallback) borrowFallback = p;
      const isDuplicate = prevResponsible && p.id === prevResponsible.id;
      if (!isDuplicate) {
        borrowBest = p;
        break;
      }
    }

    const borrowedPerson = borrowBest || borrowFallback;
    if (borrowedPerson) {
      borrowed.add(borrowedPerson.id);
      borrowOffset++;
      return borrowedPerson;
    }

    // Absolute last resort: nobody available at all
    return null;
  };

  // --- Phase 1: Simulate from anchorDate to yesterday ---
  let simulationDate = new Date(anchor);
  let prevResponsible = null;

  while (startOfDay(simulationDate) < today) {
    if (isWorkDay(simulationDate, holidays)) {
      const responsible = processDay(simulationDate, prevResponsible);
      if (responsible) prevResponsible = responsible;
    }
    simulationDate = addDays(simulationDate, 1);
  }

  // --- Phase 2: Generate visible schedule from today onwards ---
  const schedule = [];
  let currentDate = new Date(today);
  let previousResponsible = prevResponsible;

  while (schedule.length < daysToGenerate) {
    if (isWorkDay(currentDate, holidays)) {
      const responsible = processDay(currentDate, previousResponsible);
      schedule.push({ date: new Date(currentDate), responsible });
      if (responsible) previousResponsible = responsible;
    }
    currentDate = addDays(currentDate, 1);
  }

  return schedule;
};
