import React from 'react';
import Schedule from '../components/Schedule';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

const Home = () => {
  return (
    <motion.div 
      className="space-y-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="text-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-tight tracking-tighter"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Acompanhe a Escala
        </motion.h1>
        <motion.p 
          className="max-w-2xl mx-auto mt-4 text-xl text-gray-400"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Veja quem é o responsável pelo café e pão de queijo nos próximos dias.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <Schedule />
      </motion.div>

    </motion.div>
  );
};

export default Home;
