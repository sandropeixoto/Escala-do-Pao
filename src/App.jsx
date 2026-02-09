import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { FiHome, FiSettings, FiCoffee } from 'react-icons/fi';
import { motion } from 'framer-motion';

const App = () => {
  const PageLayout = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );

  const linkClasses = "px-4 py-2 rounded-full text-lg font-medium transition-all duration-300 ease-in-out flex items-center space-x-2";
  const inactiveLink = "text-gray-400 hover:text-white hover:bg-white/10";
  const activeLink = "text-white bg-white/10 shadow-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans">
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/5">
        <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <NavLink to="/" className="flex items-center space-x-2 text-2xl font-black tracking-wider">
            <FiCoffee className="text-purple-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Escala do Pão
            </span>
          </NavLink>
          <div className="flex items-center space-x-4">
            <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLink : inactiveLink}`}>
              <FiHome />
              <span>Início</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `${linkClasses} ${isActive ? activeLink : inactiveLink}`}>
              <FiSettings />
              <span>Gerenciar</span>
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <Routes>
          <Route path="/" element={<PageLayout><Home /></PageLayout>} />
          <Route path="/admin" element={<PageLayout><Admin /></PageLayout>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
