// ============================================================
// Форматы заданий. Спецификация профиля: 25 одиночного выбора,
// 5 множественного выбора, 5 на соответствие, 5 на понимание
// условия, сложность А/В/С = 50/30/20.
// Здесь поддержаны одиночный и множественный выбор; остальные два
// формата требуют другой модели данных (см. README).
// ============================================================

export function qType(q) {
  return q && q.type === 'multiple' ? 'multiple' : 'single';
}

// Индексы верных вариантов — всегда отсортированный массив
export function answerSet(q) {
  const a = q ? q.answer : null;
  return (Array.isArray(a) ? a : [a]).slice().sort((x, y) => x - y);
}

// Одиночный выбор хранит число, множественный — массив чисел
export function isCorrect(q, pick) {
  if (qType(q) === 'single') return typeof pick === 'number' && pick === q.answer;
  if (!Array.isArray(pick)) return false;
  const a = pick.slice().sort((x, y) => x - y);
  const correct = answerSet(q);
  return a.length === correct.length && a.every((v, i) => v === correct[i]);
}

// Ответ не засчитан, если выбран не весь верный набор — на ЕНТ частичных
// баллов за множественный выбор нет
export function answerLetters(q) {
  return answerSet(q).map(i => ['A', 'B', 'C', 'D', 'E'][i]).join(' · ');
}
