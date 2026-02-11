import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { FiSettings, FiCalendar, FiSave, FiLoader } from 'react-icons/fi';

registerLocale('ptBR', ptBR);

const Settings = () => {
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'schedule'));
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          if (settings.startDate?.toDate) {
            setStartDate(settings.startDate.toDate());
          }
        } else {
          setStartDate(new Date()); // Default se não houver configuração
        }
      } catch (err) {
        setError('Falha ao carregar as configurações.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleDateChange = (date) => {
    setStartDate(date);
    setSuccess(false); // Reseta a mensagem de sucesso ao mudar a data
  };

  const handleSave = async () => {
    if (!startDate) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const settingsRef = doc(db, 'settings', 'schedule');
      await setDoc(settingsRef, { startDate }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Esconde a mensagem após 3s
    } catch (err) {
      setError('Falha ao salvar. Verifique a conexão com o Firebase.');
      console.error(err);
    }
    finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-black/20 p-8 rounded-3xl shadow-2xl border border-white/10 h-full">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <FiSettings className="mr-3 text-purple-400" />
        Configurações da Escala
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-24">
            <FiLoader className="animate-spin text-3xl text-purple-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="start-date" className="font-medium text-white/90 mb-2 sm:mb-0">
              Data de Início (Âncora)
            </label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={handleDateChange}
              locale="ptBR"
              dateFormat="dd/MM/yyyy"
              className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving || !startDate}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-5 py-3 font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
            <span>{isSaving ? 'Salvando...' : 'Salvar Data de Início'}</span>
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center mt-2">Data de início salva com sucesso!</p>}
        </div>
      )}
    </div>
  );
};

export default Settings;
