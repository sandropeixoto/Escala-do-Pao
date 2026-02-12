import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Holidays = () => {
  const [date, setDate] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, 'holidays'), orderBy('date'));
    const querySnapshot = await getDocs(q);
    const holidaysList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        date: data.date?.toDate ? data.date.toDate() : null 
      };
    }).filter(h => h.date);
    setHolidays(holidaysList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;

    setIsSubmitting(true);
    try {
      const dateObject = parseISO(date); 
      await addDoc(collection(db, 'holidays'), { date: dateObject });
      setDate('');
      await fetchHolidays();
    } catch (error) {
      console.error("Erro ao adicionar feriado: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'holidays', id));
      await fetchHolidays();
    } catch (error) {
      console.error("Erro ao deletar feriado: ", error);
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-black/20 p-8 rounded-3xl shadow-2xl border border-white/10 h-full">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center"><FiCalendar className="mr-3 text-pink-400"/>Feriados/Não Considerar</h3>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
        <input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
        />
        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-5 py-2 font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 flex items-center">
          {isSubmitting ? <FiLoader className="animate-spin" /> : <FiPlus />}
        </button>
      </form>

      <div className="space-y-3 pr-2 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FiLoader className="animate-spin text-3xl text-pink-400" />
          </div>
        ) : (
          <AnimatePresence>
            {holidays.map(h => (
              <motion.div 
                key={h.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex justify-between items-center bg-white/5 p-3 rounded-lg"
              >
                <span className="font-medium text-white/90 capitalize">
                  {format(h.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <button onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-300 transition-colors">
                  <FiTrash2 />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && holidays.length === 0 && (
          <p className="text-center text-gray-500 py-8">Nenhum feriado cadastrado.</p>
        )}
      </div>
      <style>
        {`
          input[type="date"] {
            color-scheme: dark;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}
      </style>
    </div>
  );
};

export default Holidays;
