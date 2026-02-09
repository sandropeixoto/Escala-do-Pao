import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { generateSchedule } from '../utils/schedule';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const participantsCollection = await getDocs(collection(db, 'participants'));
        const participants = participantsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.order - b.order);

        const holidaysCollection = await getDocs(collection(db, 'holidays'));
        const holidays = holidaysCollection.docs.map(doc => doc.data().date.toDate());

        const generatedSchedule = generateSchedule(participants, holidays);
        setSchedule(generatedSchedule);
      } catch (error) {
        console.error("Error fetching schedule: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return <p>Carregando escala...</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Próximos 10 dias</h2>
      <ul>
        {schedule.map(({ date, responsible }, index) => (
          <li key={index} className="flex justify-between items-center py-2 border-b last:border-0">
            <span className="text-gray-600">{format(date, "dd/MM/yyyy '-' EEEE", { locale: ptBR })}</span>
            <span className="font-semibold">{responsible.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
