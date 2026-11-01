// ============================================================
// Страница «Пробный ЕНТ»: полный формат — 120 заданий, 240 минут,
// без мгновенной подсветки, сетка навигации, отметка «на проверку»,
// авто-завершение по таймеру и разбор ошибок после сдачи.
// ============================================================

import { t, bi, esc, toast } from '../ui.js';
import { load, save } from '../core/storage.js';
import { EXAM, CREATIVE_COMBO } from '../config.js';
import { SUBJECTS } from '../data/subjects.js';
import { startExam, activeExam, resolveQuestion, gradeExam, finishExam } from '../core/exam.js';

let lastGrade = null;   // результат только что завершённого пробника
let gridOpen = false;
let timerId = null;

function fmtLeft(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function tick() {
  const st = load();
  if (!st.exam) return;
  const left = st.exam.endsAt - Date.now();
  const el = document.getElementById('examTimer');
  if (el) {
    el.textContent = fmtLeft(left);
    el.classList.toggle('low', left < 15 * 60000);
  }
  if (left <= 0) {
    clearInterval(timerId); timerId = null;
    toast(t('examTimeUp'));
    lastGrade = finishExam();
    window.__rerender();
  }
}

function runningView(session) {
  const i = session.cur || 0;
  session.cur = i;
  const slot = session.questions[i];
  const q = resolveQuestion(slot);
  const letters = ['A', 'B', 'C', 'D'];
  const opts = q ? bi(q.options) : [];
  const picked = session.answers[i];
  const optBtns = opts.map((o, k) =>
    `<button class="opt ${picked === k ? 'selected' : ''}" data-action="pick" data-idx="${k}"><b>${letters[k]}.</b> ${esc(o)}</button>`).join('');
  const flagged = session.flagged.includes(i);

  const grid = gridOpen ? `<div class="exam-grid">
    ${session.questions.map((_, k) => {
      const cls = ['exam-cell'];
      if (session.answers[k] !== null) cls.push('answered');
      if (session.flagged.includes(k)) cls.push('flagged');
      if (k === i) cls.push('current');
      return `<div class="${cls.join(' ')}" data-action="goto" data-idx="${k}">${k + 1}</div>`;
    }).join('')}</div>` : '';

  return `<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <span class="badge">📝 ${t('examTitle')}</span>
      <span class="timer" id="examTimer">${fmtLeft(session.endsAt - Date.now())}</span>
    </div>
    <p class="muted">${t('examQuestion', { i: i + 1, n: session.questions.length })}</p>
    <div class="q-text">${q ? esc(bi(q.text)) : '—'}</div>
    <div class="opt-grid">${optBtns}</div>
    <div class="row" style="margin-top:12px">
      <button class="btn ghost" data-action="prev" ${i === 0 ? 'disabled' : ''}>←</button>
      <button class="btn" data-action="next" ${i >= session.questions.length - 1 ? 'disabled' : ''}>→</button>
      <button class="btn ghost" data-action="flag">${flagged ? '🔶' : '🔷'} ${t('examFlag')}</button>
      <button class="btn ghost" data-action="toggleGrid">${t('examGrid')}</button>
    </div>
    ${grid}
    <div style="margin-top:12px"><button class="btn big secondary" data-action="finish">${t('examFinish')}</button></div>
  </div>`;
}

function resultView() {
  const g = lastGrade;
  const rows = Object.entries(g.bySubject).map(([id, b]) =>
    `<div class="threshold-row"><span>${SUBJECTS[id]?.icon || ''} ${esc(bi(SUBJECTS[id]?.name) || id)}</span>
      <span>${b.correct}/${b.total}</span></div>`).join('');
  const wrong = g.reviewWrong || [];
  const review = wrong.length
    ? `<h3>${t('examReviewTitle')}</h3>` + wrong.map(w => `<div class="card">
        <p class="muted">${esc(bi(w.subject))} · ${esc(bi(w.topic))}</p>
        <div class="q-text">${esc(bi(w.text))}</div>
        <p><span class="badge ok">${['A', 'B', 'C', 'D'][w.answer]}. ${esc(bi(w.options)[w.answer])}</span></p>
        <div class="explain">💡 ${esc(bi(w.explain))}</div>
      </div>`).join('')
    : `<p class="muted">${t('examNoErrors')}</p>`;
  return `<div class="card" style="text-align:center">
    <h2>${t('examResultTitle')}</h2>
    <div class="score-big">${g.score}</div>
    <p class="muted">${t('examScoreLine', { s: g.score })} · ${t('examCorrectLine', { c: g.correct, n: g.total })}</p>
    <p class="muted">${t('examPoints', { p: g.correct * 2 })}</p>
  </div>
  <div class="card"><h3>${t('examBySubject')}</h3>${rows}</div>
  ${review}
  <div class="row" style="margin-bottom:16px">
    <button class="btn" data-action="new">${t('examNew')}</button>
    <a class="btn ghost" href="#/home">${t('examHome')}</a>
  </div>`;
}

function introView() {
  const st = load();
  const hist = (st.examHistory || []).map(h =>
    `<div class="threshold-row"><span>${esc(h.date)}</span><span><b>${h.score}</b> · ${h.correct}/${h.total}</span></div>`).join('');
  return `<div class="card">
    <h2>📝 ${t('examTitle')}</h2>
    <ul class="muted" style="margin:8px 0 14px 18px;line-height:1.7">
      <li>${t('examRule1', { n: EXAM.totalQuestions })}</li>
      <li>${t('examRule2', { min: EXAM.durationMin })}</li>
      <li>${t('examRule3')}</li>
      <li>${t('examRule4')}</li>
    </ul>
    <button class="btn big" data-action="start">${t('examStart')}</button>
  </div>
  <div class="card"><h3>${t('examHistoryTitle')}</h3>${hist || `<p class="muted">${t('examNoHistory')}</p>`}</div>`;
}

export default {
  render() {
    const st = load();
    if (!st.combo) return `<div class="card">${t('chooseComboFirst')} → <a href="#/home">${t('navHome')}</a></div>`;
    if (st.combo === CREATIVE_COMBO.id) return `<div class="card">🎨 ${t('examCreativeNote')}</div>`;
    const session = activeExam();
    if (session) return runningView(session);
    if (lastGrade) return resultView();
    return introView();
  },

  afterRender() {
    const st = load();
    if (st.exam && !timerId) timerId = setInterval(tick, 1000);
    if (!st.exam && timerId) { clearInterval(timerId); timerId = null; }
    if (st.exam) save({ exam: { ...st.exam } }); // фиксируем cur после runningView
  },

  actions: {
    start() { startExam(); lastGrade = null; window.__rerender(); },
    pick(el) {
      const st = load(); if (!st.exam) return;
      const i = st.exam.cur || 0;
      st.exam.answers[i] = Number(el.dataset.idx);
      save({ exam: st.exam });
      window.__rerender();
    },
    next() { const st = load(); if (st.exam) { st.exam.cur = Math.min((st.exam.cur || 0) + 1, st.exam.questions.length - 1); save({ exam: st.exam }); window.__rerender(); } },
    prev() { const st = load(); if (st.exam) { st.exam.cur = Math.max((st.exam.cur || 0) - 1, 0); save({ exam: st.exam }); window.__rerender(); } },
    goto(el) { const st = load(); if (st.exam) { st.exam.cur = Number(el.dataset.idx); save({ exam: st.exam }); window.__rerender(); } },
    flag() {
      const st = load(); if (!st.exam) return;
      const i = st.exam.cur || 0;
      const f = st.exam.flagged;
      st.exam.flagged = f.includes(i) ? f.filter(x => x !== i) : [...f, i];
      save({ exam: st.exam });
      window.__rerender();
    },
    toggleGrid() { gridOpen = !gridOpen; window.__rerender(); },
    finish() {
      const st = load(); if (!st.exam) return;
      if (!confirm(t('examConfirm'))) return;
      // собираем разбор ошибок (до закрытия сессии)
      const grade = gradeExam(st.exam);
      grade.reviewWrong = [];
      st.exam.questions.forEach((slot, i) => {
        const q = resolveQuestion(slot);
        // в разбор идут только ОТВЕЧЕННЫЕ неверно (пропуски — не «ошибка знания»)
        if (q && st.exam.answers[i] !== null && st.exam.answers[i] !== q.answer) {
          grade.reviewWrong.push({
            subject: SUBJECTS[slot.subjectId]?.name, topic: q.topic,
            text: q.text, options: q.options, answer: q.answer, explain: q.explain,
          });
        }
      });
      finishExam();
      lastGrade = grade;
      window.__rerender();
    },
    new() { lastGrade = null; window.__rerender(); },
  },
};
