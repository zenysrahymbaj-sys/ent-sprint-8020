// ============================================================
// Хранилище. Язык и тема — на устройство, весь прогресс — на ученика:
// каждый профиль лежит в своём ключе ent-sprint-p:<номер>.
// Пока никто не вошёл, состояние живёт только в памяти.
// ============================================================

import { dataKeyFor, activePhone, readDevice, writeDevice, readLegacy, readJson, writeJson, KEYS } from './scope.js';

const DEVICE_FIELDS = ['lang', 'theme'];

const DEFAULT_STATE = {
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
let cachePhone = null;

// Первый профиль на устройстве наследует прогресс до появления входа:
// старый ключ остаётся на месте, чтобы откат был возможен.
function legacyFor(phone) {
  const raw = readLegacy();
  if (!raw) return {};
  const auth = readJson(KEYS.AUTH_KEY) || {};
  if (auth.migratedFrom) return {};
  auth.migratedFrom = phone;
  writeJson(KEYS.AUTH_KEY, auth);
  const { lang, theme, ...rest } = raw;
  // сразу фиксируем в профиль: без этого перенос живёт только в памяти
  // и исчезает при первой же перезагрузке
  writeJson(dataKeyFor(phone), rest);
  return rest;
}

export function load() {
  const phone = activePhone();
  if (cache && cachePhone === phone) return cache;
  const legacy = readLegacy() || {};
  const device = { lang: legacy.lang, theme: legacy.theme, ...readDevice() }; // экран входа тоже помнит выбор языка
  const picked = {};
  if (device.lang) picked.lang = device.lang;
  if (device.theme) picked.theme = device.theme;
  const own = phone ? (readJson(dataKeyFor(phone)) || legacyFor(phone)) : {};
  cache = { ...structuredClone(DEFAULT_STATE), lang: 'ru', theme: 'light', ...picked, ...own, phone };
  cachePhone = phone;
  return cache;
}

export function save(patch) {
  const st = load();
  const next = { ...(patch || {}) };
  const device = {};
  for (const f of DEVICE_FIELDS) if (f in next) { device[f] = next[f]; delete next[f]; }
  if (Object.keys(device).length) writeDevice({ ...readDevice(), ...device });
  delete next.phone;
  // device-поля вырезаны из next, но кэш состояния тоже обязан их видеть,
  // иначе applyTheme() читает старую тему до перезагрузки
  Object.assign(st, next, device);
  if (st.phone && Object.keys(next).length) {
    const { lang, theme, phone, ...own } = st;
    writeJson(dataKeyFor(st.phone), own);
  }
  return st;
}

// Сброс касается только текущего ученика: язык и тема устройства остаются
export function reset() {
  const st = load();
  cache = null; cachePhone = null;
  if (st.phone) try { localStorage.removeItem(dataKeyFor(st.phone)); } catch { /* ignore */ }
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
