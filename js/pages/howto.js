// ============================================================
// «Как учиться»: 7 шагов системы + трекер выполнения
// + рекомендации по использованию ресурсов каждого предмета.
// ============================================================

import { t, bi, esc } from '../ui.js';
import { load, save } from '../core/storage.js';
import { SUBJECTS } from '../data/subjects.js';
import { userWeights } from '../core/predictor.js';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'];

export default {
  render() {
    const st = load();
    const done = st.howto || {};
    const steps = STEPS.map(id => `
      <label class="step ${done[id] ? 'done' : ''}">
        <input type="checkbox" ${done[id] ? 'checked' : ''} data-action="toggle" data-step="${id}">
        <div class="step-body"><b>${t(id + 't')}</b><div class="muted">${t(id + 'd')}</div></div>
      </label>`).join('');

    const advice = userWeights(st).map(w => {
      const s = SUBJECTS[w.id];
      if (!s) return '';
      return `<div class="card">
        <h3>${s.icon || '📘'} ${esc(bi(s.name))}</h3>
        <p style="line-height:1.5">${esc(bi(s.advice))}</p>
      </div>`;
    }).join('');

    return `<div class="title">📚 ${t('howtoTitle')}</div>
      <div class="card"><p class="muted" style="margin-bottom:6px">${t('howtoIntro')}</p>${steps}</div>
      <h2 style="margin:14px 0 8px">${t('subjectAdviceTitle')}</h2>
      ${advice}`;
  },

  actions: {
    toggle(el) {
      const st = load();
      const howto = { ...(st.howto || {}) };
      const step = el.dataset.step;
      if (howto[step]) delete howto[step]; else howto[step] = true;
      save({ howto });
      window.__rerender();
    },
  },
};
