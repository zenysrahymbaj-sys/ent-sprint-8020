// ============================================================
// Профиль: очки/стринг/лига, график прогноза, слабые темы,
// калькулятор «Трек спасения», настройки (дата, пороги, сброс).
// ============================================================

import { t, bi, esc, toast } from '../ui.js';
import { load, save, reset, todayStr, daysBetween } from '../core/storage.js';
import { EXAM, DEFAULT_THRESHOLDS, CREATIVE_COMBO } from '../config.js';
import { predictScore } from '../core/predictor.js';
import { currentLeague } from '../core/gamification.js';
import { buildRescuePlan } from '../core/rescue.js';
import { weakTopics } from '../core/review.js';
import { SUBJECTS, comboLabel } from '../data/subjects.js';

function chart(log) {
  if (log.length < 2) return `<p class="muted">${t('noDataYet')}</p>`;
  const w = 320, h = 120, pad = 8;
  const xs = (i) => pad + (i / (log.length - 1)) * (w - 2 * pad);
  const ys = (v) => h - pad - (Math.min(v, EXAM.maxScore) / EXAM.maxScore) * (h - 2 * pad);
  const pts = log.map((e, i) => `${xs(i)},${ys(e.score)}`).join(' ');
  return `<div class="chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <line x1="${pad}" y1="${ys(EXAM.maxScore)}" x2="${w - pad}" y2="${ys(EXAM.maxScore)}" stroke="var(--border)"/>
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2"/>
    ${log.map((e, i) => `<circle cx="${xs(i)}" cy="${ys(e.score)}" r="3" fill="var(--accent)"/>`).join('')}
  </svg></div>`;
}

export default {
  render() {
    const st = load();
    const league = currentLeague();
    const score = predictScore(st);
    const totalAnswers = Object.values(st.stats).reduce((a, s) => a + s.total, 0);
    const date = st.examDate || EXAM.defaultExamDate;
    const days = Math.max(0, daysBetween(todayStr(), date));
    const th = { ...DEFAULT_THRESHOLDS, ...(st.thresholds || {}) };

    const stats = `<div class="stats-grid">
      <div class="card stat-box"><div class="stat-num">${st.points}</div><div class="muted">${t('statPoints')}</div></div>
      <div class="card stat-box"><div class="stat-num">🔥 ${st.streak}</div><div class="muted">${t('statStreak')}</div></div>
      <div class="card stat-box"><div class="stat-num">${league.icon} ${t(league.key)}</div><div class="muted">${t('statLeague')}</div></div>
      <div class="card stat-box"><div class="stat-num">${totalAnswers}</div><div class="muted">${t('statAnswers')}</div></div>
    </div>`;

    const chartCard = `<div class="card"><h2>${t('scoreChart')}</h2>${chart(st.scoreLog)}</div>`;

    const weak = weakTopics();
    const weakCard = `<div class="card"><h2>${t('weakTopicsTitle')}</h2>` +
      (weak.length
        ? `<table class="weak">${weak.map(([id, n]) => {
            const s = st.stats[id];
            const acc = s && s.total ? Math.round((s.correct / s.total) * 100) : null;
            return `<tr><td>${SUBJECTS[id]?.icon || ''} ${esc(bi(SUBJECTS[id]?.name) || id)}</td>
              <td>${n} ${t('errorsCount')}</td><td>${acc === null ? '—' : acc + '%'}</td></tr>`;
          }).join('')}</table>`
        : `<p class="muted">${t('noWeak')}</p>`) + `</div>`;

    // --- Калькулятор «Трек спасения» ---
    const rescueForm = `<div class="card">
      <h2>🧮 ${t('rescueTitle')}</h2>
      <p class="muted">${t('rescueCurrentLabel')}: <b>${score}</b> · ${t('rescueDaysLabel')}: <b>${days}</b></p>
      <label class="field">${t('rescueTarget')}</label>
      <input type="number" id="rescueTarget" min="0" max="${EXAM.maxScore}" value="120">
      <div style="margin-top:10px"><button class="btn" data-action="rescue">${t('rescueBtn')}</button></div>
      ${rescuePlanView(st)}
    </div>`;

    // --- Настройки ---
    const comboTxt = st.combo === CREATIVE_COMBO.id ? t('creativeMode') : (st.combo ? esc(comboLabel(st.combo)) : '—');
    const settings = `<div class="card">
      <h2>⚙️ ${t('settingsTitle')}</h2>
      <label class="field">${t('examDateLabel')}</label>
      <input type="date" id="examDateInput" value="${esc(date)}">
      <label class="field">${t('comboLabel')}</label>
      <div class="row"><span>${comboTxt}</span>
        <button class="btn ghost" data-action="changeCombo">${t('changeCombo')}</button></div>
      <label class="field">${t('thresholdsEdit')}</label>
      <div class="row" style="gap:6px">
        <input type="number" id="thNational" value="${th.national}" title="${t('thNational')}">
        <input type="number" id="thOther" value="${th.other}" title="${t('thOther')}">
        <input type="number" id="thPedLaw" value="${th.pedagogic_legal}" title="${t('thPedLaw')}">
        <input type="number" id="thHealth" value="${th.health}" title="${t('thHealth')}">
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn" data-action="saveSettings">${t('saveBtn')}</button>
        <button class="btn ghost" data-action="resetAll">🗑 ${t('resetData')}</button>
      </div>
    </div>`;

    return `<div class="title">👤 ${t('profileTitle')}</div>${stats}${chartCard}${weakCard}${rescueForm}${settings}`;
  },

  actions: {
    rescue() {
      const st = load();
      const target = Number(document.getElementById('rescueTarget').value);
      const days = Math.max(0, daysBetween(todayStr(), st.examDate || EXAM.defaultExamDate));
      buildRescuePlan({ target, days, state: st });
      window.__rerender();
    },
    saveSettings() {
      save({
        examDate: document.getElementById('examDateInput').value || EXAM.defaultExamDate,
        thresholds: {
          national: Number(document.getElementById('thNational').value),
          other: Number(document.getElementById('thOther').value),
          pedagogic_legal: Number(document.getElementById('thPedLaw').value),
          health: Number(document.getElementById('thHealth').value),
        },
      });
      toast(t('saved'));
      window.__rerender();
    },
    changeCombo() {
      save({ combo: null });
      location.hash = '#/home';
    },
    resetAll() {
      if (confirm(t('confirmReset'))) { reset(); location.reload(); }
    },
  },
};

function rescuePlanView(st) {
  const plan = st.rescue;
  if (!plan) return '';
  const head = `<p style="margin-top:10px"><b>${t('rescuePlan')}</b> — ${t('rescueGap', { gap: plan.gap })}</p>` +
    (plan.feasible ? '' : `<p class="badge warn">${t('rescueImpossible')}</p>`);
  const rows = plan.perSubject.map(p => `
    <div class="threshold-row">
      <span>${SUBJECTS[p.id]?.icon || ''} <b>${esc(bi(SUBJECTS[p.id]?.name) || p.id)}</b>
        <span class="muted">(${p.questions} ${t('rescueWeight')})</span></span>
      <span>${p.cardsPerDay} ${t('rescueCardsPerDay')} · ${p.tasksPerDay} ${t('rescueTasksPerDay')} · ${t('rescueAcc')} ${p.targetAccuracy}%</span>
    </div>`).join('');
  return head + rows;
}
