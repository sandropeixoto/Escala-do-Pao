import React from 'react';
import Schedule from '../components/Schedule';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Escala do Pão</h1>
      </header>
      <main className="max-w-2xl mx-auto">
        <Schedule />
      </main>
    </div>
  );
};

export default Home;
