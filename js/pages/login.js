// ============================================================
// Вход ученика: номер телефона + код-пароль. Пока никто не вошёл,
// остальной интерфейс недоступен — прогресс у каждого свой.
// ============================================================

import { t, esc, toast } from '../ui.js';
import { accounts, hasAccounts, register, login, normalizePhone, formatPhone } from '../core/auth.js';

let mode = hasAccounts() ? 'login' : 'register';
let busy = false;

const ERRORS = {
  badPhone: 'authErrPhone', shortPin: 'authErrPin', pinMismatch: 'authErrMismatch',
  exists: 'authErrExists', noAccount: 'authErrNoAccount', wrongPin: 'authErrWrong',
  notSecure: 'authErrSecure', storageOff: 'authErrStorage',
};

function field(id, label, type, extra = '') {
  return `<label class="field">${t(label)}</label><input id="${id}" type="${type}" ${extra} autocomplete="off">`;
}

function accountsList() {
  const list = accounts();
  if (!list.length) return '';
  return `<label class="field">${t('authSaved')}</label><div class="row" style="flex-wrap:wrap">
    ${list.map(a => `<button class="btn ghost" data-action="pickAccount" data-phone="${a.phone}">
      ${esc(a.name ? a.name + ' · ' + formatPhone(a.phone) : formatPhone(a.phone))}</button>`).join('')}
  </div>`;
}

function formView() {
  const reg = mode === 'register';
  const inputs = reg
    ? `${field('authName', 'authName', 'text', 'maxlength="40"')}
       ${field('authPhone', 'authPhone', 'tel', 'inputmode="numeric" placeholder="+7 7__ ___ __ __"')}
       ${field('authPin', 'authPin', 'password', 'inputmode="numeric" minlength="4" maxlength="8" placeholder="••••"')}
       ${field('authPin2', 'authPin2', 'password', 'inputmode="numeric" minlength="4" maxlength="8" placeholder="••••"')}`
    : `${field('authPhone', 'authPhone', 'tel', 'inputmode="numeric" placeholder="+7 7__ ___ __ __"')}
       ${field('authPin', 'authPin', 'password', 'inputmode="numeric" minlength="4" maxlength="8" placeholder="••••"')}`;
  return `<div class="hero">
      <div class="hero-kicker flip" style="--d:0s">⚡ ${t('appTitle')} · <span class="grad">80/20</span></div>
      <h1 class="hero-title"><span class="flip" style="--d:.09s">${t('authTitle')}</span></h1>
      <p class="hero-sub flip" style="--d:.2s">${t('tagline')}</p>
    </div>
  <div class="card">
    <div class="row" style="margin-bottom:10px">
      <button class="btn ${mode === 'login' ? '' : 'ghost'}" data-action="setMode" data-mode="login">${t('authTabLogin')}</button>
      <button class="btn ${reg ? '' : 'ghost'}" data-action="setMode" data-mode="register">${t('authTabRegister')}</button>
    </div>
    ${inputs}
    <p class="muted" style="margin-top:10px">${t(reg ? 'authHintRegister' : 'authHintLogin')}</p>
    <div style="margin-top:12px">
      <button class="btn big" data-action="submit" ${busy ? 'disabled' : ''}>${busy ? '⏳' : '→ ' + t(reg ? 'authTabRegister' : 'authTabLogin')}</button>
    </div>
    ${accountsList()}
    <p class="badge warn" style="margin-top:12px;display:inline-block">⚠️ ${t('authDisclaimer')}</p>
  </div>`;
}

const value = id => (document.getElementById(id) || {}).value || '';

async function submit() {
  if (busy) return;
  // значения читаем до любой перерисовки: render() заново создаёт inputs и обнулил бы форму
  const data = { name: value('authName'), phone: value('authPhone'), pin: value('authPin'), pin2: value('authPin2') };
  const btn = document.querySelector('[data-action="submit"]');
  busy = true;
  if (btn) btn.disabled = true;
  const res = mode === 'register'
    ? await register(data)
    : await login({ phone: data.phone, pin: data.pin });
  busy = false;
  if (btn) btn.disabled = false;
  if (res.error) {
    toast(t(ERRORS[res.error] || 'authErrWrong'));
    return;
  }
  location.hash = '#/home';
  location.reload(); // прогресс и язык теперь берутся из ключа этого ученика
}

export default {
  render() { return formView(); },

  actions: {
    setMode(el) { mode = el.dataset.mode === 'register' ? 'register' : 'login'; window.__rerender(); },
    submit() { submit(); },
    pickAccount(el) {
      mode = 'login';
      window.__rerender();
      const p = el.dataset.phone;
      const f = document.getElementById('authPhone');
      if (f) f.value = formatPhone(p);
      const c = document.getElementById('authPin');
      if (c) c.focus();
    },
  },
};
