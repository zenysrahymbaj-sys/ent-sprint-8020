// ============================================================
// UI-слой: язык, тема, перевод t(), toast-уведомления.
// ============================================================

import ru from './i18n/ru.js';
import kz from './i18n/kz.js';
import { load, save } from './core/storage.js';

const dicts = { ru, kz };

export function lang() { return load().lang || 'ru'; }

// t('ofMax', {max:140}) => подстановка {placeholder}
export function t(key, vars) {
  let s = (dicts[lang()] && dicts[lang()][key]) || (dicts.ru[key]) || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

// Двойной текст {ru, kz} => строка для текущего языка
export function bi(obj) { return (obj && (obj[lang()] ?? obj.ru)) || ''; }

export function setLang(l) {
  save({ lang: l });
  document.documentElement.lang = l;
  document.querySelectorAll('#langToggle button').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === l));
  // переводим статичные подписи в шапке/навигации
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
}

export function applyTheme() {
  const theme = load().theme || 'dark';
  document.body.dataset.theme = theme;
  document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
}

export function toggleTheme() {
  const next = (load().theme || 'dark') === 'light' ? 'dark' : 'light';
  save({ theme: next });
  applyTheme();
}

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

// Экранирование для вставки данных в HTML
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
