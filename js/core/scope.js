// ============================================================
// Ключи localStorage и область видимости: чей профиль открыт.
// Отдельный модуль, чтобы auth.js и storage.js не тянули друг друга.
// ============================================================

const AUTH_KEY = 'ent-sprint-auth';       // { active, accounts: { phone: {name,salt,hash,created} } }
const DEVICE_KEY = 'ent-sprint-device';   // язык и тема — на устройство, а не на ученика
const LEGACY_KEY = 'ent-sprint-v1';       // прогресс до появления профилей
const PROFILE_PREFIX = 'ent-sprint-p:';   // + нормализованный номер

export function dataKeyFor(phone) { return PROFILE_PREFIX + phone; }

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; } // приватный режим / переполнение — молчим, но не падаем
}

export const KEYS = { AUTH_KEY, DEVICE_KEY, LEGACY_KEY };
export { readJson, writeJson };

export function readAuth() { return readJson(AUTH_KEY) || { active: null, accounts: {} }; }
export function writeAuth(auth) { return writeJson(AUTH_KEY, auth); }
export function activePhone() { const a = readAuth(); return a.active || null; }

export function readDevice() { return readJson(DEVICE_KEY) || {}; }
export function writeDevice(d) { return writeJson(DEVICE_KEY, d); }

export function readLegacy() { return readJson(LEGACY_KEY) || null; }
