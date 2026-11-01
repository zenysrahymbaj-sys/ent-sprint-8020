// ============================================================
// Карточки: лайфхаки, шпаргалки, мнемоники по предметам.
// Клик по карточке «переворачивает» её (показывает back).
// ============================================================

import { t, bi, esc } from '../ui.js';
import { load } from '../core/storage.js';
import { SUBJECTS } from '../data/subjects.js';
import { userWeights } from '../core/predictor.js';

let currentSubject = null;          // выбранный предмет (в рамках сессии)
const flipped = new Set();          // id перевёрнутых карточек

function subjectIds(st) {
  const ids = userWeights(st).map(w => w.id);
  // обязательные предметы доступны всегда
  return [...new Set(ids)];
}

export default {
  render() {
    const st = load();
    const ids = subjectIds(st);
    if (!currentSubject || !ids.includes(currentSubject)) currentSubject = ids[0];
    const chips = ids.map(id =>
      `<button class="chip ${id === currentSubject ? 'active' : ''}" data-action="pick" data-id="${id}">
        ${esc(bi(SUBJECTS[id]?.name) || id)}</button>`).join('');
    const sub = SUBJECTS[currentSubject];
    if (!sub) return `<div class="card">${t('chooseComboFirst')}</div>`;
    const cards = sub.cards.map(c => `
      <div class="card" style="cursor:pointer" data-action="flip" data-id="${c.id}">
        <div class="row" style="justify-content:space-between">
          <h3>${esc(bi(c.title))}</h3>
          ${c.draft ? `<span class="badge warn">${t('draftBadge')}</span>` : ''}
        </div>
        <div class="${flipped.has(c.id) ? '' : 'muted'}" style="margin-top:6px;line-height:1.5">
          ${flipped.has(c.id) ? esc(bi(c.back)) : '🔄 ' + t('cardsOpen')}
        </div>
      </div>`).join('');
    return `<div class="title">🃏 ${t('cardsTitle')}</div>
      <div class="chips">${chips}</div>
      <p class="muted" style="margin-bottom:10px">${t('draftNote')}</p>
      ${cards}`;
  },

  actions: {
    pick(el) { currentSubject = el.dataset.id; flipped.clear(); window.__rerender(); },
    flip(el) {
      const id = el.dataset.id;
      flipped.has(id) ? flipped.delete(id) : flipped.add(id);
      window.__rerender();
    },
  },
};
