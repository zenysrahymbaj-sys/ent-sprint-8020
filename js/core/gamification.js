// ============================================================
// Геймификация: очки, стрик, потеря очков за пропуск, лига.
// ============================================================

import { GAME } from '../config.js';
import { load, save, todayStr, daysBetween } from './storage.js';
import { predictScore } from './predictor.js';

// Вызывать при каждом верном ответе
export function addCorrectPoints(n = 1) {
  const st = load();
  touchStreak(st);
  save({ points: st.points + n * GAME.pointsPerCorrect });
}

// Отмечает активность: продлевает или сбрасывает стрик,
// начисляет штраф за каждый пропущенный день.
export function touchStreak(st = load()) {
  const today = todayStr();
  if (st.lastActiveDate === today) return; // уже занимались сегодня
  let penalty = 0;
  if (st.lastActiveDate) {
    const gap = daysBetween(st.lastActiveDate, today);
    if (gap === 1) {
      st.streak += 1; // продолжен
    } else if (gap > 1) {
      penalty = gap * GAME.penaltyPerMissedDay;
      st.streak = 1; // сброшен, сегодня новый день
      st.points = Math.max(0, st.points - penalty);
    }
  } else {
    st.streak = 1;
  }
  st.lastActiveDate = today;
  save({ streak: st.streak, lastActiveDate: st.lastActiveDate, points: st.points });
  return penalty;
}

// Текущая лига по очкам
export function currentLeague() {
  const pts = load().points;
  let best = GAME.leagues[0];
  for (const l of GAME.leagues) if (pts >= l.min) best = l;
  return best;
}

// Прогноз балла для графика профиля
export function logScore() {
  const st = load();
  const score = predictScore(st);
  const today = todayStr();
  const log = st.scoreLog.filter(e => e.date !== today);
  log.push({ date: today, score });
  log.sort((a, b) => a.date.localeCompare(b.date));
  save({ scoreLog: log.slice(-60) }); // храним последние 60 точек
}
