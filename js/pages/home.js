// ============================================================
// Главная: дни до ЕНТ, прогноз балла, сегодняшний спринт,
// выбор комбинации при первом входе, очередь повторений.
// ============================================================

import { t, esc, toast } from '../ui.js';
import { load, save, todayStr, daysBetween } from '../core/storage.js';
import { EXAM, COMBOS, CREATIVE_COMBO, DEFAULT_THRESHOLDS } from '../config.js';
import { predictScore } from '../core/predictor.js';
import { comboLabel, subjectName } from '../data/subjects.js';
import { dueReviews } from '../core/review.js';

export function examDate() { return load().examDate || EXAM.defaultExamDate; }
export function thresholds() { return { ...DEFAULT_THRESHOLDS, ...(load().thresholds || {}) }; }

function comboPicker() {
  const items = COMBOS.map(c =>
    `<button class="combo-item" data-action="chooseCombo" data-id="${c.id}">${esc(comboLabel(c.id))}</button>`).join('');
  const creative = `<button class="combo-item" data-action="chooseCombo" data-id="creative">🎨 <b>${t('creativeMode')}</b><div class="muted">${t('creativeHint')}</div></button>`;
  return `<div class="card">
    <h2>${t('comboTitle')}</h2>
    <p class="muted">${t('comboHint')}</p>
    <div class="combo-list" style="margin-top:10px">${items}${creative}</div>
  </div>`;
}

function labelOf(id) {
  const l = comboLabel(id);
  return esc(l);
}

function thresholdsBlock(score) {
  const th = thresholds();
  const rows = [
    ['thNational', th.national], ['thOther', th.other],
    ['thPedLaw', th.pedagogic_legal], ['thHealth', th.health],
  ].map(([k, v]) => {
    const ok = score >= v;
    return `<div class="threshold-row"><span>${t(k)}: <b>${v}</b></span>
      <span class="badge ${ok ? 'ok' : 'warn'}">${ok ? t('reached') : t('notReached')}</span></div>`;
  }).join('');
  return `<h3>${t('thresholdsTitle')}</h3>${rows}`;
}

// Крупный типографический фокус: каждая строка въезжает со своей задержкой (--d)
function heroBlock(sub) {
  return `<div class="hero">
    <div class="hero-kicker flip" style="--d:0s">⚡ ${t('kickerPareto')}</div>
    <h1 class="hero-title">
      <span class="flip" style="--d:.08s">${t('appTitle')}</span>
      <span class="grad flip" style="--d:.18s">80/20</span>
    </h1>
    ${sub ? `<p class="hero-sub flip" style="--d:.3s">${sub}</p>` : ''}
  </div>`;
}

export default {
  render() {
    const st = load();
    if (!st.combo) {
      return `${heroBlock()}
        <div class="card muted">${t('tagline')}</div>${comboPicker()}`;
    }

    const date = examDate();
    const days = daysBetween(todayStr(), date);
    const isCreative = st.combo === CREATIVE_COMBO.id;
    const score = predictScore(st);
    const pct = Math.min(100, Math.round(score / EXAM.maxScore * 100));
    const due = dueReviews().length;
    const plan = st.rescue && !isCreative ? st.rescue : null;

    const daysCard = `<div class="card" style="text-align:center">
      <div class="score-big">${days >= 0 ? days : 0}</div>
      <div class="muted">${t('daysToExam')} · ${esc(date)}</div>
      <div class="row" style="justify-content:center;margin-top:10px">
        <input type="date" id="examDateInput" value="${esc(date)}" style="width:auto">
        <button class="btn ghost" data-action="saveDate">${t('changeDate')}</button>
      </div>
    </div>`;

    const forecast = isCreative ? `<div class="card">🎨 <b>${t('creativeMode')}</b>
      <div class="muted">${t('creativeHint')} → <a href="#/howto">${t('navHowto')}</a> · <a href="#/resources">${t('navResources')}</a></div></div>` :
      `<div class="card">
      <h2>${t('forecast')}</h2>
      <div class="score-big">${score}<span class="muted" style="font-size:16px"> ${t('ofMax', { max: EXAM.maxScore })}</span></div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <p class="muted">${t('noDataYet')}</p>
      ${thresholdsBlock(score)}
      </div>`;

    const sprintCta = isCreative ? '' : `<div class="card">
      <h2>⚡ ${t('todaySprint')}</h2>
      <a class="btn big" href="#/sprint">${t('startSprint')}</a>
      <a class="btn secondary big" href="#/exam" style="margin-top:8px">${t('examCta')}</a>
      ${due > 0 ? `<div style="margin-top:10px"><a class="btn secondary" href="#/sprint?review">${t('dueReviews')}: <b>${due}</b> → ${t('openReviews')}</a></div>`
                : `<p class="muted" style="margin-top:8px">${t('dueReviewsNone')}</p>`}
    </div>`;

    const planCard = plan ? `<div class="card">
      <h2>🧭 ${t('planToday')}</h2>
      ${plan.perSubject.map(p => `<div class="threshold-row">
        <span><b>${labelOfSubject(p.id)}</b></span>
        <span>${p.cardsPerDay} ${t('planCards')} · ${p.tasksPerDay} ${t('planTasks')}</span></div>`).join('')}
    </div>` : (!isCreative ? `<p class="muted" style="margin-bottom:12px">${t('planNone')}.</p>` : '');

    return `${heroBlock()}
      <div class="card muted">🎯 ${t('tagline')} · ${t('comboLabel')}: <b>${isCreative ? t('creativeMode') : labelOf(st.combo)}</b></div>
      ${daysCard}${forecast}${sprintCta}${planCard}`;
  },

  actions: {
    chooseCombo(el) {
      save({ combo: el.dataset.id });
      toast(t('comboSaved'));
      window.__rerender();
    },
    saveDate() {
      const v = document.getElementById('examDateInput').value;
      if (v) { save({ examDate: v }); toast(t('saved')); window.__rerender(); }
    },
  },
};

function labelOfSubject(id) { return esc(subjectName(id)); }
