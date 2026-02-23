
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { FiUser, FiCalendar, FiPlus, FiTrash2, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Absences = ({ participants }) => {
  const [participantId, setParticipantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [absences, setAbsences] = useState([]);
  const [error, setError] = useState('');

  const fetchAbsences = useCallback(async () => {
    const absencesQuery = query(collection(db, 'absences'), orderBy('startDate', 'desc'));
    const absencesSnapshot = await getDocs(absencesQuery);
    const absencesList = absencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAbsences(absencesList);
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  const handleAddAbsence = async (e) => {
    e.preventDefault();
    if (!participantId || !startDate || !endDate) {
      setError('Por favor, preencha todos os campos para agendar a ausência.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('A data de início não pode ser posterior à data de término.');
      return;
    }
    setError('');

    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    await addDoc(collection(db, 'absences'), {
      participantId,
      participantName: participant.name,
      startDate,
      endDate,
    });

    setParticipantId('');
    setStartDate('');
    setEndDate('');
    fetchAbsences();
  };

  const handleDeleteAbsence = async (id) => {
    await deleteDoc(doc(db, 'absences', id));
    fetchAbsences();
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl shadow-lg">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white/90 mb-1">Gerenciar Ausências</h2>
        <p className="text-sm text-white/50 mb-6">Agende as férias ou ausências da equipe. A escala será ajustada automaticamente.</p>

        <form onSubmit={handleAddAbsence} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="participant-select" className="text-xs font-semibold text-white/70 mb-2 block">Participante</label>
            <select
              id="participant-select"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300"
            >
              <option value="" disabled>Selecione...</option>
              {participants.map(p => (
                <option key={p.id} value={p.id} className="bg-gray-800">{p.name}</option>
              ))}
            </select>
          </div>
          <div>
             <label htmlFor="start-date" className="text-xs font-semibold text-white/70 mb-2 block">Início</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 calendar-icon"
            />
          </div>
          <div>
             <label htmlFor="end-date" className="text-xs font-semibold text-white/70 mb-2 block">Fim</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 calendar-icon"
            />
          </div>
          <div className="col-span-1 md:col-span-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transform hover:scale-105"
            >
              <FiPlus />
              Agendar Ausência
            </button>
          </div>
        </form>
         {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
      </div>

      <div className="border-t border-white/10 px-8 py-4">
         <h3 className="text-lg font-bold text-white/80 mb-4">Ausências Agendadas</h3>
        <div className="space-y-3 h-48 overflow-y-auto pr-2">
          <AnimatePresence>
            {absences.length > 0 ? absences.map(absence => (
              <motion.div
                key={absence.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FiUser className="text-purple-400"/>
                  <span className="font-medium text-white/90">{absence.participantName}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <FiCalendar/>
                        <span>{new Date(absence.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {new Date(absence.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                    </div>
                  <button
                    onClick={() => handleDeleteAbsence(absence.id)}
                    className="text-red-500 hover:text-red-400 transition-colors duration-200"
                    aria-label="Excluir ausência"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </motion.div>
            )) : (
                <div className="text-center text-white/40 pt-10">Nenhuma ausência agendada.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Absences;
