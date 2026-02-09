import { addDays, isWeekend, isSameDay } from 'date-fns';

/**
 * Gera a escala para os próximos N dias úteis.
 * 
 * @param {Array} participants - Lista de participantes (objetos com id e nome).
 * @param {Array<Date>} holidays - Lista de datas de feriados.
 * @param {number} daysToGenerate - Quantidade de dias úteis para gerar na escala.
 * @returns {Array} - A escala gerada.
 */
export const generateSchedule = (participants, holidays, daysToGenerate = 10) => {
  if (!participants || participants.length === 0) {
    return [];
  }

  const schedule = [];
  let currentDate = new Date();
  let participantIndex = 0;

  while (schedule.length < daysToGenerate) {
    // Ignora fins de semana.
    if (isWeekend(currentDate)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Ignora feriados.
    const isHoliday = holidays.some(holiday => isSameDay(holiday, currentDate));
    if (isHoliday) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Atribui o responsável e avança para o próximo dia e participante.
    const responsible = participants[participantIndex];
    schedule.push({ date: currentDate, responsible });

    currentDate = addDays(currentDate, 1);
    participantIndex = (participantIndex + 1) % participants.length; // Rotação circular
  }

  return schedule;
};
