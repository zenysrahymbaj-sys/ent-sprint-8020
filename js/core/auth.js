// ============================================================
// Профиль ученика на устройстве: номер телефона + код-пароль.
//
// Это НЕ защита данных. Сервера нет, поэтому код не проверяется снаружи:
// любой с доступом к устройству может прочитать localStorage напрямую.
// Смысл входа — раздельный прогресс у разных учеников за одним планшетом.
// Код хранится как PBKDF2-хеш с солью, чтобы не оставлять PIN в открытом виде.
// ============================================================

import { readAuth, writeAuth, activePhone } from './scope.js';

const ITERATIONS = 150000;

// +7 7XX XXX XX XX → 11 цифр, первая 7
export function normalizePhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return '7' + d;
  if (d.length === 11 && d[0] === '8') return '7' + d.slice(1);
  if (d.length === 11 && d[0] === '7') return d;
  return null;
}

export function formatPhone(d) {
  if (!d || d.length !== 11) return d || '';
  return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt() {
  const s = new Uint8Array(16);
  crypto.getRandomValues(s);
  return toHex(s.buffer);
}

async function derive(phone, pin, salt) {
  if (!crypto || !crypto.subtle) throw new Error('notSecure');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(`${salt}|${phone}`), iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return toHex(bits);
}

export function accounts() {
  const a = readAuth();
  return Object.entries(a.accounts || {}).map(([phone, v]) => ({ phone, ...v }));
}

export function hasAccounts() { return accounts().length > 0; }

export function activeAccount() {
  const phone = activePhone();
  if (!phone) return null;
  const a = readAuth().accounts[phone] || {};
  return { phone, name: a.name || '', created: a.created || null };
}

function validPin(pin) { return /^\d{4,8}$/.test(String(pin || '')); }

export async function register({ name, phone, pin, pin2 }) {
  const p = normalizePhone(phone);
  if (!p) return { error: 'badPhone' };
  if (!validPin(pin)) return { error: 'shortPin' };
  if (pin !== pin2) return { error: 'pinMismatch' };
  const auth = readAuth();
  if (auth.accounts[p]) return { error: 'exists' };
  let salt, hash;
  try {
    salt = randomSalt();
    hash = await derive(p, pin, salt);
  } catch {
    return { error: 'notSecure' };
  }
  auth.accounts = { ...auth.accounts, [p]: { name: String(name || '').slice(0, 40), salt, hash, created: Date.now() } };
  auth.active = p;
  if (!writeAuth(auth)) return { error: 'storageOff' };
  return { ok: true, phone: p };
}

export async function login({ phone, pin }) {
  const p = normalizePhone(phone);
  if (!p) return { error: 'badPhone' };
  const auth = readAuth();
  const acc = auth.accounts[p];
  if (!acc) return { error: 'noAccount' };
  if (!validPin(pin)) return { error: 'shortPin' };
  let hash;
  try { hash = await derive(p, pin, acc.salt); }
  catch { return { error: 'notSecure' }; }
  if (hash !== acc.hash) return { error: 'wrongPin' };
  auth.active = p;
  writeAuth(auth);
  return { ok: true, phone: p };
}

export function logout() {
  const auth = readAuth();
  auth.active = null;
  writeAuth(auth);
}
