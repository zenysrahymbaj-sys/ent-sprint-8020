// ============================================================
// Ресурсы: официальные источники + подборка по предметам.
// url === null => кнопка не активна, плашка «добавить вручную».
// ============================================================

import { t, bi, esc } from '../ui.js';
import { load } from '../core/storage.js';
import { SUBJECTS } from '../data/subjects.js';
import { userWeights } from '../core/predictor.js';
import { OFFICIAL, BY_SUBJECT, SPECS, SPEC_DOCS } from '../data/resources.js';

function entryHtml(r) {
  // ok === false => адрес проверялся, но недоступен: предупреждаем, а не молчим
  const warn = r.url && r.ok === false ? `<span class="badge warn">⚠ ${t('resUnreachable')}</span>` : '';
  const link = r.url
    ? `<a class="btn ${r.ok === false ? 'ghost' : ''}" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${t('resOpen')} ↗</a>`
    : `<div class="row"><button class="btn ghost" disabled>➕ ${t('resManual')}</button>
       <span class="manual-note">${t('resManualNote')}</span></div>`;
  return `<div class="res-item">
    <div class="res-title">${esc(bi(r.title))} ${warn}</div>
    <p class="muted"><b>${t('resWhat')}:</b> ${esc(bi(r.what))}</p>
    <p class="muted"><b>${t('resHow')}:</b> ${esc(bi(r.how))}</p>
    <div style="margin-top:8px">${link}</div>
  </div>`;
}

// Официальная спецификация НЦТ по предмету (PDF) — есть не по всем предметам
function specEntry(subjectId) {
  const url = SPECS[subjectId];
  if (!url) return null;
  const name = bi(SUBJECTS[subjectId]?.name) || subjectId;
  return {
    url,
    ok: true,
    title: { ru: `Спецификация НЦТ: ${name}`, kz: `ҰТО спецификациясы: ${name}` },
    what: {
      ru: 'Официальный PDF НЦТ: перечень тем, состав и типы заданий, время на задание.',
      kz: 'ҰТО-ның ресми PDF-і: тақырыптар тізімі, тапсырма құрамы мен түрлері, бір тапсырмаға берілетін уақыт.',
    },
    how: {
      ru: 'Сверьте темы наших карточек с таблицей «Раздел → Тема»: приоритет (принцип Парето) ставьте по разделам с наибольшим числом тем.',
      kz: 'Карточка тақырыптарын «Бөлім → Тақырып» кестесімен салыстырыңыз: Парето басымдығын тақырыбы көп бөлімдерге қойыңыз.',
    },
  };
}

export default {
  render() {
    const st = load();
    const ids = userWeights(st).map(w => w.id);
    const official = OFFICIAL.map(entryHtml).join('');
    const perSubject = ids.map(id => {
      const docs = SPEC_DOCS.filter(d => d.subjectIds.includes(id));
      const list = [specEntry(id), ...docs, ...(BY_SUBJECT[id] || [])].filter(Boolean);
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
