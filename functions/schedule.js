import {
    addDays,
    isWeekend,
    startOfDay,
    parseISO,
    format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
 * Server-side schedule generator using Firebase Admin SDK.
 *
 * This is a direct adaptation of src/utils/schedule.js for Cloud Functions.
 * The algorithm is identical — only the data-fetching layer differs
 * (Admin SDK instead of client SDK).
 *
 * @param {FirebaseFirestore.Firestore} db - Firestore Admin instance
 * @param {number} daysToGenerate - Number of workdays to include in the output
 * @returns {Promise<Array<{date: string, weekday: string, responsible: string|null}>>}
 */
export const generateScheduleFromFirestore = async (db, daysToGenerate = 10) => {
    // Fetch all data from Firestore using Admin SDK
    const [participantsSnap, holidaysSnap, absencesSnap, settingsDoc] = await Promise.all([
        db.collection('participants').orderBy('order').get(),
        db.collection('holidays').get(),
        db.collection('absences').get(),
        db.doc('settings/schedule').get(),
    ]);

    const participants = participantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (participants.length === 0) {
        throw new Error('No participants found');
    }

    const holidays = holidaysSnap.docs
        .map(doc => {
            const data = doc.data();
            return data.date?.toDate ? data.date.toDate() : null;
        })
        .filter(Boolean);

    const absences = absencesSnap.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            startDate: parseISO(data.startDate),
            endDate: parseISO(data.endDate),
        };
    });

    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const anchorDate = settings.startDate?.toDate
        ? settings.startDate.toDate()
        : new Date('2024-01-01');

    // --- Algorithm (identical to src/utils/schedule.js) ---

    const today = startOfDay(new Date());
    const anchor = startOfDay(anchorDate);

    const getParticipant = (id) => participants.find(p => p.id === id);

    const newCycleQueue = (skipIds = new Set()) => {
        return participants.map(p => p.id).filter(id => !skipIds.has(id));
    };

    let queue = newCycleQueue();
    let borrowed = new Set();
    let borrowOffset = 0;

    const processDay = (date, prevResponsible) => {
        if (queue.length === 0) {
            queue = newCycleQueue(borrowed);
            borrowOffset = 0;
            borrowed = new Set();
        }

        const frontId = queue[0];
        const frontParticipant = getParticipant(frontId);

        if (frontParticipant && !isAbsent(frontParticipant, date, absences)) {
            queue.shift();
            return frontParticipant;
        }

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

        let borrowBest = null;
        let borrowFallback = null;

        for (let i = 0; i < participants.length; i++) {
            const pIdx = (borrowOffset + i) % participants.length;
            const p = participants[pIdx];

            if (queue.includes(p.id)) continue;
            if (borrowed.has(p.id)) continue;
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

        return null;
    };

    // Phase 1: Simulate from anchorDate to yesterday
    let simulationDate = new Date(anchor);
    let prevResponsible = null;

    while (startOfDay(simulationDate) < today) {
        if (isWorkDay(simulationDate, holidays)) {
            const responsible = processDay(simulationDate, prevResponsible);
            if (responsible) prevResponsible = responsible;
        }
        simulationDate = addDays(simulationDate, 1);
    }

    // Phase 2: Generate visible schedule from today onwards
    const schedule = [];
    let currentDate = new Date(today);
    let previousResponsible = prevResponsible;

    while (schedule.length < daysToGenerate) {
        if (isWorkDay(currentDate, holidays)) {
            const responsible = processDay(currentDate, previousResponsible);
            schedule.push({
                date: format(currentDate, 'yyyy-MM-dd'),
                weekday: format(currentDate, 'EEEE', { locale: ptBR }),
                responsible: responsible?.name || null,
            });
            if (responsible) previousResponsible = responsible;
        }
        currentDate = addDays(currentDate, 1);
    }

    return schedule;
};
