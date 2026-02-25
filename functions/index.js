import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateScheduleFromFirestore } from './schedule.js';

initializeApp();
const db = getFirestore();

/**
 * HTTP Cloud Function: GET /api/schedule
 *
 * Query params:
 *   - days (number, default 10): how many upcoming workdays to return
 *
 * Returns JSON with the generated schedule.
 */
export const api = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed. Use GET.' });
        return;
    }

    const days = Math.min(Math.max(parseInt(req.query.days) || 10, 1), 60);

    try {
        const schedule = await generateScheduleFromFirestore(db, days);

        res.status(200).json({
            generated_at: new Date().toISOString(),
            total: schedule.length,
            schedule,
        });
    } catch (err) {
        console.error('Schedule generation error:', err);
        res.status(500).json({
            error: 'Failed to generate schedule',
            message: err.message,
        });
    }
});
