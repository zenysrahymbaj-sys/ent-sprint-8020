// ============================================================
// Точка входа: инициализация + hash-роутер SPA.
// Маршруты: #/home #/sprint #/cards #/howto #/resources #/profile
// ============================================================

import { EXAM } from './config.js';
import { load, save } from './core/storage.js';
import { setLang, applyTheme, toggleTheme, toast } from './ui.js';
import { touchStreak } from './core/gamification.js';
import home from './pages/home.js';
import sprint from './pages/sprint.js';
import cards from './pages/cards.js';
import resources from './pages/resources.js';
import howto from './pages/howto.js';
import profile from './pages/profile.js';
import exam from './pages/exam.js';

const routes = { home, sprint, cards, resources, howto, profile, exam };

function render() {
  const name = (location.hash.replace('#/', '') || 'home').split('?')[0];
  const page = routes[name] || home;
  document.querySelector('main').innerHTML = page.render(location.hash);
  // подсветка активной вкладки
  document.querySelectorAll('.tabbar a').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === `#/${name}`));
  if (page.afterRender) page.afterRender();
}

// Обработчик кликов по навигации языка/темы
document.getElementById('langToggle').addEventListener('click', e => {
  const btn = e.target.closest('button[data-lang]');
  if (!btn) return;
  setLang(btn.dataset.lang);
  render();
});
document.getElementById('themeToggle').addEventListener('click', () => toggleTheme());

// Глобальный делегат для [data-action] на страницах
document.querySelector('main').addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const name = (location.hash.replace('#/', '') || 'home').split('?')[0]; // без query-хвоста
  const fn = routes[name]?.actions?.[el.dataset.action];
  if (fn) fn(el, e);
});

window.addEventListener('hashchange', render);
window.__rerender = render; // страницы могут перерисовать себя без смены hash

// ---------- старт ----------
const st = load();
document.body.dataset.theme = st.theme || 'light';
applyTheme();
setLang(st.lang || 'ru');
touchStreak(st); // проверить стрик/штраф при открытии
if (!st.examDate) save({ examDate: EXAM.defaultExamDate });
render();

export { render, toast };
