import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { generateSchedule } from '../utils/schedule';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser, FiLoader, FiAlertTriangle, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
        return;
      }

      const holidaysSnapshot = await getDocs(collection(db, 'holidays'));
      const holidays = holidaysSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return data.date?.toDate ? data.date.toDate() : null;
        })
        .filter(Boolean);

      const generatedSchedule = generateSchedule(participants, holidays, 10);
      setSchedule(generatedSchedule);

    } catch (err) {
      console.error("Error fetching schedule: ", err);
      setError('Ocorreu um erro ao buscar a escala.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiLoader className="animate-spin text-4xl text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-6 flex flex-col items-center text-center">
        <FiAlertTriangle className="text-4xl mb-4" />
        <h3 className="font-bold text-lg">Erro ao Carregar</h3>
        <p>{error}</p>
      </div>
    );
  }

  const [today, ...upcoming] = schedule;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.5 } },
  };

  return (
    <div className="space-y-10">
      {/* Card do Responsável do Dia */}
      {today && (
        <motion.div 
          className="bg-black/20 p-8 rounded-3xl shadow-2xl border border-white/10 text-center relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
        >
          <FiAward className="absolute -top-4 -left-4 text-8xl text-purple-500/20 transform rotate-12"/>
          <h3 className="text-xl font-light text-purple-300 uppercase tracking-widest">Responsável de Hoje</h3>
          <p className="text-5xl font-bold my-2 text-white capitalize">
            {format(today.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="inline-flex items-center justify-center space-x-4 mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 text-2xl font-bold shadow-lg">
            <FiUser />
            <span>{today.responsible?.name || 'Indefinido'}</span>
          </div>
        </motion.div>
      )}

      {/* Lista dos Próximos */}
      {upcoming.length > 0 && (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-2xl font-bold text-white/80 px-4">Próximos na Escala</h3>
          <AnimatePresence>
            {upcoming.map(({ date, responsible }, index) => (
              <motion.div 
                key={index} 
                className="bg-black/10 p-4 rounded-xl flex justify-between items-center border border-white/5 shadow-md"
                variants={itemVariants}
                custom={index}
              >
                <div className="flex items-center space-x-4">
                  <FiCalendar className="text-purple-400" />
                  <span className="font-medium text-lg text-white/90 capitalize">
                    {format(date, "EEEE, dd/MM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 px-4 py-1 rounded-full">
                  <FiUser className="text-gray-400" />
                  <span className="font-semibold text-white">
                    {responsible?.name || 'Indefinido'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Schedule;
