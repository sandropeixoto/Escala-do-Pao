import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import '../react-datepicker.css';

registerLocale('ptBR', ptBR);

const Admin = () => {
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [newHolidayDate, setNewHolidayDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const participantsSnapshot = await getDocs(collection(db, 'participants'));
      const participantsData = participantsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);
      setParticipants(participantsData);

      const holidaysSnapshot = await getDocs(collection(db, 'holidays'));
      const holidaysData = holidaysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Garante que a data seja um objeto Date do JS
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date),
      }));
      setHolidays(holidaysData);
    } catch (err) {
      console.error("Error fetching data: ", err);
      setError('Falha ao carregar os dados. Verifique a conexão e as configurações do Firebase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (newParticipantName.trim() === '') return;
    try {
      const order = participants.length > 0 ? Math.max(...participants.map(p => p.order)) + 1 : 0;
      await addDoc(collection(db, 'participants'), { name: newParticipantName, order });
      setNewParticipantName('');
      fetchData();
    } catch (err) {
      console.error("Error adding participant: ", err);
      setError('Falha ao adicionar participante.');
    }
  };

  const handleDeleteParticipant = async (id) => {
    try {
      await deleteDoc(doc(db, 'participants', id));
      fetchData(); // Recarrega para ajustar a ordem visualmente
    } catch (err) {
      console.error("Error deleting participant: ", err);
      setError('Falha ao excluir participante.');
    }
  };

  const handleUpdateParticipant = async (e) => {
    e.preventDefault();
    if (!editingParticipant || editingParticipant.name.trim() === '') return;
    try {
      const participantRef = doc(db, 'participants', editingParticipant.id);
      await updateDoc(participantRef, { name: editingParticipant.name });
      setEditingParticipant(null);
      fetchData();
    } catch (err) {
      console.error("Error updating participant: ", err);
      setError('Falha ao atualizar participante.');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayDate) return;
    try {
      await addDoc(collection(db, 'holidays'), { date: newHolidayDate });
      fetchData();
    } catch (err) {
      console.error("Error adding holiday: ", err);
      setError('Falha ao adicionar feriado.');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteDoc(doc(db, 'holidays', id));
      fetchData();
    } catch (err) {
      console.error("Error deleting holiday: ", err);
      setError('Falha ao excluir feriado.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Painel de Controle</h1>
          <p className="mt-2 text-lg text-gray-500">Gerencie os participantes e feriados da escala</p>
        </header>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">{error}</div>}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Participants Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Participantes</h2>
            <form onSubmit={editingParticipant ? handleUpdateParticipant : handleAddParticipant} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editingParticipant ? editingParticipant.name : newParticipantName}
                  onChange={(e) => editingParticipant ? setEditingParticipant({ ...editingParticipant, name: e.target.value }) : setNewParticipantName(e.target.value)}
                  placeholder={editingParticipant ? "Editar nome" : "Novo participante"}
                  className="flex-grow border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
                <button type="submit" className="bg-purple-600 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform transform hover:scale-105">
                  {editingParticipant ? 'Salvar' : 'Adicionar'}
                </button>
                {editingParticipant && <button onClick={() => setEditingParticipant(null)} className="bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>}
              </div>
            </form>
            <ul className="space-y-3">
              {participants.map(p => (
                <li key={p.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="font-medium text-gray-800">{p.name} (Ordem: {p.order})</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingParticipant(p)} className="text-blue-500 hover:text-blue-700 font-semibold transition-colors">Editar</button>
                    <button onClick={() => handleDeleteParticipant(p.id)} className="text-red-500 hover:text-red-700 font-semibold transition-colors">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Holidays Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Feriados</h2>
            <form onSubmit={handleAddHoliday} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <DatePicker
                  selected={newHolidayDate}
                  onChange={(date) => setNewHolidayDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="ptBR"
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
                <button type="submit" className="w-full sm:w-auto bg-teal-500 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105">
                  Adicionar Feriado
                </button>
              </div>
            </form>
            <ul className="space-y-3">
              {holidays.map(h => (
                <li key={h.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="font-medium text-gray-800">
                    {h.date ? h.date.toLocaleDateString('pt-BR') : 'Data inválida'}
                  </span>
                  <button onClick={() => handleDeleteHoliday(h.id)} className="text-red-500 hover:text-red-700 font-semibold transition-colors">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
