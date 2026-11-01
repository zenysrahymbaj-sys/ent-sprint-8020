// ============================================================
// Журнал ошибок + интервальные повторения (1, 3, 7, 14 дней).
// Каждая ошибка записывается с датами, когда её надо повторить.
// ============================================================

import { REVIEW_DAYS } from '../config.js';
import { load, save, todayStr, daysBetween } from './storage.js';

// Записать ошибку (неправильный ответ в спринте)
export function recordError(subjectId, questionId, topic) {
  const st = load();
  // не дублируем одну и ту же тему в тот же день
  const key = `${subjectId}:${questionId}`;
  if (st.errors.some(e => e.key === key)) return;
  st.errors.push({ key, subjectId, questionId, topic, addedAt: todayStr(), reviews: [] });
  save({ errors: st.errors.slice(-200) }); // журнал ограничен 200 записями
}

// Ошибки, которые пора повторить сегодня
export function dueReviews() {
  const st = load();
  const today = todayStr();
  return st.errors.filter(e =>
    REVIEW_DAYS.some(d => {
      const due = new Date(e.addedAt); due.setDate(due.getDate() + d);
      return due.toISOString().slice(0, 10) === today && !e.reviews.includes(d);
    })
  );
}

// Отметить, что повторение на шаге d выполнено
export function completeReview(key, day) {
  const st = load();
  const e = st.errors.find(x => x.key === key);
  if (e && !e.reviews.includes(day)) { e.reviews.push(day); save({ errors: st.errors }); }
}

// Слабые темы: топ предметов по числу ошибок
export function weakTopics() {
  const st = load();
  const bySubject = {};
  for (const e of st.errors) bySubject[e.subjectId] = (bySubject[e.subjectId] || 0) + 1;
  return Object.entries(bySubject).sort((a, b) => b[1] - a[1]);
}

export function daysUntilExam(examDate) {
  return daysBetween(todayStr(), examDate);
}
