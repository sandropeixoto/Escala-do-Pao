import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { FiUsers, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Participants = () => {
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, 'participants'), orderBy('order'));
    const querySnapshot = await getDocs(q);
    const participantsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setParticipants(participantsList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const maxOrder = participants.reduce((max, p) => p.order > max ? p.order : max, 0);
      await addDoc(collection(db, 'participants'), {
        name: name.trim(),
        order: maxOrder + 1,
      });
      setName('');
      await fetchParticipants(); // Re-fetch para obter a lista atualizada
    } catch (error) {
      console.error("Erro ao adicionar participante: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'participants', id));
      await fetchParticipants(); // Re-fetch para atualizar a lista
    } catch (error) {
      console.error("Erro ao deletar participante: ", error);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-black/20 p-8 rounded-3xl shadow-2xl border border-white/10 h-full">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center"><FiUsers className="mr-3 text-purple-400"/>Participantes</h3>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do participante"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        />
        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-5 py-2 font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 flex items-center">
          {isSubmitting ? <FiLoader className="animate-spin" /> : <FiPlus />}
        </button>
      </form>

      <div className="space-y-3 pr-2 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FiLoader className="animate-spin text-3xl text-purple-400" />
          </div>
        ) : (
          <AnimatePresence>
            {participants.map(p => (
              <motion.div 
                key={p.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex justify-between items-center bg-white/5 p-3 rounded-lg"
              >
                <span className="font-medium text-white/90 capitalize">{p.name}</span>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 transition-colors">
                  <FiTrash2 />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && participants.length === 0 && (
          <p className="text-center text-gray-500 py-8">Nenhum participante cadastrado.</p>
        )}
      </div>
    </div>
  );
};

export default Participants;
