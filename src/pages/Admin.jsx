import React from 'react';
import Participants from '../components/Participants';
import Holidays from '../components/Holidays';
import { motion } from 'framer-motion';

const Admin = () => {
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
        <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-400">Gerencie os participantes e feriados para a escala do pão de queijo.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
          <Participants />
        </motion.div>
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
          <Holidays />
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
