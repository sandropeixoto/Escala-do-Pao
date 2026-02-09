import React from 'react';
import Schedule from '../components/Schedule';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div 
        className="bg-cover bg-center text-white p-10 md:p-20 text-center shadow-lg"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550989460-0d9418a096a2?q=80&w=2940&auto=format&fit=crop)' }}
      >
        <div className="bg-black bg-opacity-50 rounded-xl p-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            Escala do Pão
          </h1>
          <p className="mt-4 text-lg md:text-xl font-medium" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
            Acompanhe o responsável do dia por trazer o pão nosso de cada dia.
          </p>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 -mt-16">
        <Schedule />
      </main>

      <footer className="text-center p-4 mt-8 text-gray-500">
        <p>Feito com ❤️ e cafeína</p>
      </footer>
    </div>
  );
};

export default Home;
