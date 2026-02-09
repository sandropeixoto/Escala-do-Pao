import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { generateSchedule } from '../utils/schedule';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser, FiLoader, FiAlertTriangle } from 'react-icons/fi';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const participantsQuery = query(collection(db, 'participants'), orderBy('order'));
      const participantsSnapshot = await getDocs(participantsQuery);
      const participants = participantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (participants.length === 0) {
        setError('Nenhum participante cadastrado. Adicione participantes no painel de controle.');
        setSchedule([]);
        setLoading(false);
        return;
      }

      const holidaysSnapshot = await getDocs(collection(db, 'holidays'));
      const holidays = holidaysSnapshot.docs
        .map(doc => {
          const data = doc.data();
          // Garante que a data exista e seja um timestamp do Firestore antes de converter
          return data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : null;
        })
        .filter(Boolean); // Remove quaisquer entradas nulas/inválidas

      // Lógica de geração da escala simplificada (sem persistência por enquanto)
      const generatedSchedule = generateSchedule(participants, holidays, 10);
      setSchedule(generatedSchedule);

    } catch (err) {
      console.error("Error fetching schedule: ", err);
      setError('Ocorreu um erro ao buscar a escala. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-white shadow-2xl rounded-2xl p-8 text-center">
        <FiLoader className="animate-spin text-4xl text-purple-500 mb-4" />
        <p className="font-semibold text-lg text-gray-700">Carregando a escala...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-red-50 shadow-2xl rounded-2xl p-8 text-center">
        <FiAlertTriangle className="text-4xl text-red-500 mb-4" />
        <p className="font-semibold text-lg text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h2 className="text-3xl font-bold flex items-center justify-center">
          <FiCalendar className="mr-3" /> Próximos na Escala
        </h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {schedule.map(({ date, responsible }, index) => (
          <li 
            key={index} 
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 transition-colors duration-300 ${index === 0 ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center mb-2 sm:mb-0">
              <FiCalendar className={`text-xl ${index === 0 ? 'text-purple-700' : 'text-gray-500'}`} />
              <span className="ml-3 font-medium text-gray-800 capitalize">
                {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center bg-gray-200 rounded-full px-4 py-1 self-end sm:self-center">
              <FiUser className={`text-lg ${index === 0 ? 'text-purple-700' : 'text-gray-600'}`} />
              <span className={`ml-2 font-bold ${index === 0 ? 'text-purple-900' : 'text-gray-900'}`}>
                {responsible?.name || 'Indefinido'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
