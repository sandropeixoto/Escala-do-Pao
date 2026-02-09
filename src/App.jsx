import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { FiHome, FiSettings } from 'react-icons/fi';

function App() {
  const linkStyle = "flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-white/20 transition-colors";
  const activeLinkStyle = "bg-white/20 font-bold";

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navegação Principal */}
        <nav className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-lg shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo/Título */}
              <Link to="/" className="text-2xl font-bold text-white tracking-wider">
                Escala do Pão
              </Link>

              {/* Links de Navegação */}
              <div className="flex items-center space-x-4">
                <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                  <FiHome className="mr-2" />
                  <span>Home</span>
                </NavLink>
                <NavLink to="/admin" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                  <FiSettings className="mr-2" />
                  <span>Admin</span>
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Conteúdo da Página */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
