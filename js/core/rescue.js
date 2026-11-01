// ============================================================
// Калькулятор «Трек спасения».
// Вход: желаемый балл (0..140), текущий прогноз, дни до экзамена, предметы.
// Выход: ежедневный план — сколько карточек и заданий по каждому предмету.
// Логика Парето: дефицит баллов распределяется пропорционально весу предметов
// (20+40+40=100 «дорогих» заданий важнее 10+10).
// ============================================================

import { EXAM } from '../config.js';
import { userWeights, predictScore, accuracy } from './predictor.js';
import { save } from './storage.js';

export function buildRescuePlan({ target, days, state }) {
  target = Math.max(0, Math.min(EXAM.maxScore, target));
  const current = predictScore(state);
  const gap = Math.max(0, target - current);
  const d = Math.max(1, days);

  const weights = userWeights(state);
  const sumW = weights.reduce((a, w) => a + w.questions, 0) || 1;

  const perSubject = weights.map(w => {
    const share = gap * (w.questions / sumW);            // сколько баллов «добыть» на предмет
    const acc = accuracy(state, w.id);
    const accNow = acc === null ? 0.25 : acc;            // базовое угадывание
    const needAcc = Math.min(1, accNow + share / w.questions * (EXAM.totalQuestions / EXAM.maxScore));
    // 1 карточка ≈ +2% точности, 1 задание ≈ +3% (эмпирика первой версии)
    const accBoost = needAcc - accNow;
    const cards = Math.ceil(accBoost * w.questions / 0.02 / d);
    const tasks = Math.ceil(accBoost * w.questions / 0.03 / d);
    return { id: w.id, questions: w.questions, targetAccuracy: Math.round(needAcc * 100), cardsPerDay: Math.min(10, cards), tasksPerDay: Math.min(20, tasks) };
  });

  const feasible = gap === 0 || perSubject.some(p => p.targetAccuracy < 0.98);
  const plan = { target, days: d, gap: Math.round(gap * 10) / 10, perSubject, feasible, createdAt: new Date().toISOString().slice(0, 10) };
  save({ rescue: plan });
  return plan;
}
