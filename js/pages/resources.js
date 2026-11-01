// ============================================================
// Ресурсы: официальные источники + подборка по предметам.
// url === null => кнопка не активна, плашка «добавить вручную».
// ============================================================

import { t, bi, esc } from '../ui.js';
import { load } from '../core/storage.js';
import { SUBJECTS } from '../data/subjects.js';
import { userWeights } from '../core/predictor.js';
import { OFFICIAL, BY_SUBJECT } from '../data/resources.js';

function entryHtml(r) {
  const link = r.url
    ? `<a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${t('resOpen')} ↗</a>`
    : `<div class="row"><button class="btn ghost" disabled>➕ ${t('resManual')}</button>
       <span class="manual-note">${t('resManualNote')}</span></div>`;
  return `<div class="res-item">
    <div class="res-title">${esc(bi(r.title))}</div>
    <p class="muted"><b>${t('resWhat')}:</b> ${esc(bi(r.what))}</p>
    <p class="muted"><b>${t('resHow')}:</b> ${esc(bi(r.how))}</p>
    <div style="margin-top:8px">${link}</div>
  </div>`;
}

// Универсальная карточка для предметов без своей подборки
function genericEntry(subjectId) {
  const name = bi(SUBJECTS[subjectId]?.name) || subjectId;
  return {
    url: null,
    title: { ru: `${name}: спецификация и тематический анализ`, kz: `${name}: спецификация мен тақырыптық талдау` },
    what: {
      ru: 'Раздел свежей спецификации ЕНТ по предмету (с сайта НЦТ).',
      kz: 'ЕНТ-тің пән бойынша жаңа спецификациясының бөлімі (ҰТО сайтынан).',
    },
    how: {
      ru: 'Выпишите 20% самых «весовых» тем — по ним и стройте спринты (принцип Парето).',
      kz: 'Ең «салмақты» 20% тақырыпты жазып алыңыз — спринт соның үстіне құрылады (Парето қағидасы).',
    },
  };
}

export default {
  render() {
    const st = load();
    const ids = userWeights(st).map(w => w.id);
    const official = OFFICIAL.map(entryHtml).join('');
    const perSubject = ids.map(id => {
      const list = (BY_SUBJECT[id] || []).concat([genericEntry(id)]);
      const name = esc(bi(SUBJECTS[id]?.name) || id);
      const icon = SUBJECTS[id]?.icon || '📘';
      return `<div class="card">
        <h3>${icon} ${name}</h3>
        ${list.map(entryHtml).join('')}
      </div>`;
    }).join('');

    return `<div class="title">🔗 ${t('resTitle')}</div>
      <div class="card"><h2>${t('resOfficial')}</h2>${official}</div>
      <h2 style="margin:14px 0 8px">${t('resBySubject')}</h2>
      ${perSubject}`;
  },

  actions: {},
};
