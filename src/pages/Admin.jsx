
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Participants from '../components/Participants';
import Holidays from '../components/Holidays';
import Settings from '../components/Settings';
import Absences from '../components/Absences';
import { motion } from 'framer-motion';

const Admin = () => {
  const [participants, setParticipants] = useState([]);

  const fetchParticipants = async () => {
    const participantsCollection = collection(db, 'participants');
    const participantsSnapshot = await getDocs(participantsCollection);
    const participantsList = participantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setParticipants(participantsList);
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div className="space-y-16">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">Painel de Controle</h1>
        <p className="max-w-3xl mx-auto mt-4 text-xl text-gray-400">Gerencie participantes, feriados, ausências e configurações da escala do pão de queijo.</p>
      </motion.div>

      <div className="space-y-12">
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
          <Participants onParticipantsChanged={fetchParticipants} />
        </motion.div>
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
          <Absences participants={participants} />
        </motion.div>
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
          <Holidays />
        </motion.div>
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={4}>
          <Settings />
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
