// ============================================================
// Пробный ЕНТ (полный формат): 120 заданий, 240 минут.
// Сессия хранится в localStorage — перезагрузка страницы
// не сбрасывает экзамен, таймер считается от endsAt.
// ============================================================

import { EXAM, CREATIVE_COMBO } from '../config.js';
import { userWeights } from './predictor.js';
import { SUBJECTS } from '../data/subjects.js';
import { load, save } from './storage.js';

// Собираем 120 слотов: веса предметов из predictor (20+10+10+40+40).
// Банк v1 — по 10 вопросов на предмет, поэтому вопросы циклично
// повторяются (помечены draft). Меньше 10 повторов одной карточки
// не делаем: перемешиваем со смещением.
export function buildExam() {
  const st = load();
  if (!st.combo || st.combo === CREATIVE_COMBO.id) return [];
  const slots = [];
  for (const w of userWeights(st)) {
    const qs = (SUBJECTS[w.id] && SUBJECTS[w.id].questions) || [];
    if (!qs.length) continue;
    const rotated = qs.slice((w.questions % qs.length)).concat(qs.slice(0, (w.questions % qs.length)));
    for (let i = 0; i < w.questions; i++) {
      slots.push({ subjectId: w.id, qid: rotated[i % rotated.length].id });
    }
  }
  // перемешиваем (Fisher–Yates)
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

export function startExam() {
  const questions = buildExam();
  if (!questions.length) return null;
  const session = {
    startedAt: Date.now(),
    endsAt: Date.now() + EXAM.durationMin * 60000,
    answers: new Array(questions.length).fill(null),
    flagged: [],
    questions, // [{subjectId, qid}]
  };
  save({ exam: session });
  return session;
}

// Активная сессия (или null, если её нет/время вышло — тогда не возвращаем,
// страница сама вызовет finish по истечении endsAt)
export function activeExam() {
  return load().exam || null;
}

export function resolveQuestion(slot) {
  const sub = SUBJECTS[slot.subjectId];
  return sub ? sub.questions.find(q => q.id === slot.qid) : null;
}

// Проверка: правильный балл = верные × (140/120) — та же шкала, что в прогнозе
export function gradeExam(session) {
  let correct = 0;
  const bySubject = {};
  session.questions.forEach((slot, i) => {
    const q = resolveQuestion(slot);
    if (!q) return;
    const b = bySubject[slot.subjectId] || (bySubject[slot.subjectId] = { correct: 0, total: 0 });
    b.total += 1;
    if (session.answers[i] === q.answer) { b.correct += 1; correct += 1; }
  });
  const score = Math.round(correct * (EXAM.maxScore / EXAM.totalQuestions) * 10) / 10;
  return { correct, total: session.questions.length, score, bySubject };
}

// Завершение: результат в историю, ошибки в журнал, балл на график, очки
import { todayStr } from './storage.js';
import { logScore } from './gamification.js';
import { recordError } from './review.js';
import { bi } from '../ui.js';

export function finishExam() {
  const st = load();
  const session = st.exam;
  if (!session) return null;
  const grade = gradeExam(session);
  const history = (st.examHistory || []).concat([{
    date: todayStr(), score: grade.score, correct: grade.correct, total: grade.total,
  }]).slice(-20);
  // ошибки пробника — в журнал повторений (без дублей, cap 200 в review.js)
  session.questions.forEach((slot, i) => {
    const q = resolveQuestion(slot);
    if (q && session.answers[i] !== null && session.answers[i] !== q.answer) {
      recordError(slot.subjectId, q.id, bi(q.topic));
    }
  });
  save({ exam: null, examHistory: history, points: st.points + grade.correct * 2 });
  logScore();
  return grade;
}
