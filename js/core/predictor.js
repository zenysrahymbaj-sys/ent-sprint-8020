// ============================================================
// Прогноз балла по принципу весов ЕНТ.
// Балл ≈ (ожидаемое число верных ответов по всем 120 заданиям) × (140/120).
// Ожидание по предмету = точность пользователя × количество заданий предмета.
// ============================================================

import { EXAM, MANDATORY, PROFILE_QUESTIONS, COMBOS, CREATIVE_COMBO } from '../config.js';

// Список предметов пользователя с их весами (кол-вом заданий)
export function userWeights(state) {
  const weights = MANDATORY.map(m => ({ id: m.id, questions: m.questions }));
  if (state.combo && state.combo !== CREATIVE_COMBO.id) {
    const combo = COMBOS.find(c => c.id === state.combo);
    if (combo) for (const id of combo.subjects) weights.push({ id, questions: PROFILE_QUESTIONS });
  }
  return weights;
}

// Точность по предмету: верные / всего ответов (0..1); без данных — 0
export function accuracy(state, subjectId) {
  const s = state.stats[subjectId];
  if (!s || !s.total) return null; // нет данных
  return s.correct / s.total;
}

export function predictScore(state) {
  if (state.combo === CREATIVE_COMBO.id) return 0; // в творческом режиме нет тестовой части
  let expected = 0;
  for (const w of userWeights(state)) {
    const acc = accuracy(state, w.id);
    // без данных считаем, что ученик ответит на 25% (базовый угад A-D)
    expected += (acc === null ? 0.25 : acc) * w.questions;
  }
  const scale = EXAM.maxScore / EXAM.totalQuestions;
  return Math.round(expected * scale * 10) / 10;
}

// Покрытость: какой долей заданий пользователь уже «прикрыт» практикой
export function coverage(state) {
  const weights = userWeights(state);
  const total = weights.reduce((a, w) => a + w.questions, 0);
  const practiced = weights.reduce((a, w) => {
    const s = state.stats[w.id];
    return a + (s ? Math.min(s.total, w.questions) : 0);
  }, 0);
  return { practiced, total };
}
