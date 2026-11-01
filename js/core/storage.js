// ============================================================
// Хранилище: весь прогресс в localStorage, без регистрации.
// Один ключ = один JSON-объект состояния.
// ============================================================

const KEY = 'ent-sprint-v1';

const DEFAULT_STATE = {
  lang: 'ru',
  theme: 'light',
  examDate: null,        // строка YYYY-MM-DD, null => возьмём EXAM.defaultExamDate
  combo: null,           // выбранный id комбинации (или 'creative')
  points: 0,
  streak: 0,
  lastActiveDate: null,  // 'YYYY-MM-DD' последнего занятия
  stats: {},             // { subjectId: {correct, total} } по всем предметам
  scoreLog: [],          // [{date, score}] — история прогноза
  errors: [],            // журнал ошибок для интервальных повторений
  howto: {},             // { stepId: true } — отметки шагов
  rescue: null,          // сохранённый расчёт «трека спасения»
  thresholds: null,      // пользовательские пороги (null => дефолт из config)
  exam: null,            // активная сессия полного пробника (null => нет)
  examHistory: [],       // [{date, score, correct, total}] последних 20 пробников
};

let cache = null;

export function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) } : structuredClone(DEFAULT_STATE);
  } catch {
    cache = structuredClone(DEFAULT_STATE);
  }
  return cache;
}

export function save(patch) {
  const st = load();
  Object.assign(st, patch);
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* хранилище недоступно */ }
  return st;
}

export function reset() {
  cache = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromISO, toISO) {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
