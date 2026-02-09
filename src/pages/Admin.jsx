import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import '../react-datepicker.css';

registerLocale('ptBR', ptBR);

const Admin = () => {
  // Participant State
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState(null);

  // Holiday State
  const [holidays, setHolidays] = useState([]);
  const [newHolidayDate, setNewHolidayDate] = useState(new Date());

  // Loading State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const participantsCollection = await getDocs(collection(db, 'participants'));
      const participantsData = participantsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.order - b.order);
      setParticipants(participantsData);

      const holidaysCollection = await getDocs(collection(db, 'holidays'));
      const holidaysData = holidaysCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHolidays(holidaysData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Participant Handlers
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (newParticipantName.trim() === '') return;

    try {
      const newParticipant = { name: newParticipantName, order: participants.length };
      await addDoc(collection(db, 'participants'), newParticipant);
      setNewParticipantName('');
      fetchData();
    } catch (error) {
      console.error("Error adding participant: ", error);
    }
  };

  const handleDeleteParticipant = async (id) => {
    try {
      await deleteDoc(doc(db, 'participants', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting participant: ", error);
    }
  };

  const handleEditParticipant = (participant) => {
    setEditingParticipant(participant);
  };

  const handleUpdateParticipant = async (e) => {
    e.preventDefault();
    if (!editingParticipant || editingParticipant.name.trim() === '') return;

    try {
      const participantRef = doc(db, 'participants', editingParticipant.id);
      await updateDoc(participantRef, { name: editingParticipant.name });
      setEditingParticipant(null);
      fetchData();
    } catch (error) {
      console.error("Error updating participant: ", error);
    }
  };

  // Holiday Handlers
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'holidays'), { date: newHolidayDate });
      fetchData();
    } catch (error) {
      console.error("Error adding holiday: ", error);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteDoc(doc(db, 'holidays', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting holiday: ", error);
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Admin</h1>
      </header>
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Participants Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Participantes</h2>
          <form onSubmit={handleAddParticipant} className="mb-4">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Nome do participante"
              className="border p-2 rounded w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Adicionar</button>
          </form>
          <ul>
            {participants.map(p => (
              <li key={p.id} className="flex justify-between items-center py-2 border-b">
                {editingParticipant && editingParticipant.id === p.id ? (
                  <form onSubmit={handleUpdateParticipant} className="flex-grow">
                    <input
                      type="text"
                      value={editingParticipant.name}
                      onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                      className="border p-2 rounded w-full"
                    />
                    <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded ml-2">Salvar</button>
                    <button onClick={() => setEditingParticipant(null)} className="bg-gray-500 text-white px-2 py-1 rounded ml-2">Cancelar</button>
                  </form>
                ) : (
                  <span className="flex-grow">{p.name}</span>
                )}
                <div>
                  <button onClick={() => handleEditParticipant(p)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                  <button onClick={() => handleDeleteParticipant(p.id)} className="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Holidays Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Feriados</h2>
          <form onSubmit={handleAddHoliday} className="mb-4">
            <DatePicker
              selected={newHolidayDate}
              onChange={(date) => setNewHolidayDate(date)}
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              className="border p-2 rounded w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Adicionar Feriado</button>
          </form>
          <ul>
            {holidays.map(h => (
              <li key={h.id} className="flex justify-between items-center py-2 border-b">
                <span>{h.date.toDate().toLocaleDateString('pt-BR')}</span>
                <button onClick={() => handleDeleteHoliday(h.id)} className="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Admin;
