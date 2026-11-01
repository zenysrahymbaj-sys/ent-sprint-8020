// ============================================================
// Спринт: 5-минутный микро-тест. A/B/C/D, мгновенная подсветка
// зелёным/красным + короткий разбор «на пальцах».
// Режим повторений: #/sprint?review — вопросы из журнала ошибок.
// ============================================================

import { t, bi, esc, toast } from '../ui.js';
import { load, save } from '../core/storage.js';
import { EXAM, MANDATORY, CREATIVE_COMBO } from '../config.js';
import { SUBJECTS } from '../data/subjects.js';
import { userWeights } from '../core/predictor.js';
import { addCorrectPoints, logScore } from '../core/gamification.js';
import { recordError, dueReviews, completeReview } from '../core/review.js';

// Состояние сессии живёт в модуле (SPA не перезагружает страницу)
let session = null;
let timerId = null;

function shuffle(a) { return a.slice().sort(() => Math.random() - 0.5); }

function userSubjectIds(st) {
  // обязательные + профильные; в творческом режиме профиля нет (но и спринта нет)
  return userWeights(st).map(w => w.id);
}

function pickQuestionIds(st, subjectId) {
  // вопросы, по которым есть ошибки, ставим в приоритет
  const wrong = new Set(st.errors.filter(e => e.subjectId === subjectId).map(e => e.questionId));
  const sub = SUBJECTS[subjectId];
  if (!sub) return [];
  const first = sub.questions.filter(q => wrong.has(q.id));
  const rest = sub.questions.filter(q => !wrong.has(q.id));
  return [...shuffle(first), ...shuffle(rest)];
}

function startSession(subjectId, topicText) {
  const st = load();
  let pool;
  if (st.combo === CREATIVE_COMBO.id) return null;
  if (topicText) {
    pool = SUBJECTS[subjectId].questions.filter(q => bi(q.topic) === topicText);
  } else {
    pool = pickQuestionIds(st, subjectId);
  }
  const list = pool.slice(0, EXAM.questionsPerSprint);
  if (!list.length) return null;
  if (timerId) clearInterval(timerId);
  session = {
    subjectId, list, idx: 0, correct: 0, answered: false, lastPick: null,
    remaining: EXAM.sprintSeconds, phase: 'quiz', reviewMode: false,
  };
  return session;
}

function startReviewSession() {
  const st = load();
  const due = dueReviews();
  if (!due.length) return null;
  const list = [];
  for (const e of due) {
    const sub = SUBJECTS[e.subjectId];
    const q = sub && sub.questions.find(x => x.id === e.questionId);
    if (q) { list.push({ q, subjectId: e.subjectId, key: e.key }); }
  }
  if (!list.length) return null;
  if (timerId) clearInterval(timerId);
  session = {
    subjectId: list[0].subjectId, list, idx: 0, correct: 0, answered: false,
    remaining: EXAM.sprintSeconds, phase: 'quiz', reviewMode: true,
  };
  return session;
}

function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

function finish() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  if (session) { session.phase = 'done'; logScore(); }
  window.__rerender();
}

function tick() {
  if (!session || session.phase !== 'quiz') return;
  session.remaining -= 1;
  const el = document.getElementById('sprintTimer');
  if (el) {
    el.textContent = fmtTime(Math.max(0, session.remaining));
    el.classList.toggle('low', session.remaining <= 60);
  }
  if (session.remaining <= 0) { toast(t('sprintTimeUp')); finish(); }
}

function quizView() {
  const cur = session.reviewMode ? session.list[session.idx].q : session.list[session.idx];
  const q = cur;
  const subjectName = bi(SUBJECTS[session.reviewMode ? session.list[session.idx].subjectId : session.subjectId].name);
  const opts = bi(q.options);
  const letters = ['A', 'B', 'C', 'D'];
  const answeredCls = (i) => {
    if (!session.answered) return '';
    if (i === q.answer) return 'correct';
    if (i === session.lastPick) return 'wrong';
    return 'dim';
  };
  const buttons = opts.map((o, i) =>
    `<button class="opt ${answeredCls(i)}" ${session.answered ? 'disabled' : ''}
      data-action="answer" data-idx="${i}"><b>${letters[i]}.</b> ${esc(o)}</button>`).join('');
  const expl = session.answered ? `<div class="explain">💡 <b>${t('sprintExplain')}:</b> ${esc(bi(q.explain))}</div>` : '';
  const isLast = session.idx + 1 >= session.list.length;
  const nextBtn = session.answered
    ? `<button class="btn big" data-action="next" style="margin-top:12px">${isLast ? '🏁 ' + t('sprintResult') : '→ ' + t('sprintQuestion', { i: session.idx + 2, n: session.list.length })}</button>` : '';
  return `<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <span class="badge">${esc(subjectName)}${session.reviewMode ? ' · 🔁' : ''}</span>
      <span class="timer" id="sprintTimer">${fmtTime(Math.max(0, session.remaining))}</span>
    </div>
    <div class="progress"><div style="width:${(session.idx / session.list.length) * 100}%"></div></div>
    <p class="muted">${t('sprintQuestion', { i: session.idx + 1, n: session.list.length })} · ${t('microTopic')}: ${esc(bi(q.topic))}</p>
    <div class="q-text">${esc(bi(q.text))}</div>
    <div class="opt-grid">${buttons}</div>
    ${expl}${nextBtn}
  </div>`;
}

function picker() {
  const st = load();
  if (st.combo === CREATIVE_COMBO.id) {
    return `<div class="card">🎨 <b>${t('creativeMode')}</b><p class="muted">${t('creativeHint')}</p>
      <div class="row" style="margin-top:10px"><a class="btn" href="#/howto">${t('navHowto')}</a>
      <a class="btn secondary" href="#/resources">${t('navResources')}</a></div></div>`;
  }
  if (!st.combo) return `<div class="card">${t('chooseComboFirst')} → <a href="#/home">${t('navHome')}</a></div>`;
  const ids = userSubjectIds(st);
  const options = ids.map(id => `<option value="${id}">${esc(bi(SUBJECTS[id] && SUBJECTS[id].name) || id)}</option>`).join('');
  return `<div class="card">
    <h2>⚡ ${t('sprintPick')}</h2>
    <label class="field">${t('sprintPickSubject')}</label>
    <select id="sprintSubject">${options}</select>
    <label class="field">${t('microTopic')}</label>
    <select id="sprintTopic"><option value="">— ({any}) —</option></select>
    <div style="margin-top:12px"><button class="btn big" data-action="start">${t('sprintStart')}</button></div>
    ${dueReviews().length ? `<div style="margin-top:10px"><a class="btn secondary" href="#/sprint?review">🔁 ${t('dueReviews')} (${dueReviews().length})</a></div>` : ''}
  </div>`;
}

function resultView() {
  return `<div class="card" style="text-align:center">
    <h2>${t('sprintResult')}</h2>
    <div class="score-big">${session.correct}/${session.list.length}</div>
    <p class="muted">${t('sprintCorrect', { c: session.correct, n: session.list.length })}</p>
    <div class="row" style="justify-content:center;margin-top:12px">
      <button class="btn" data-action="again">${t('sprintAgain')}</button>
      <a class="btn ghost" href="#/home">${t('sprintHome')}</a>
    </div>
  </div>`;
}

export default {
  render(hash) {
    if (load().combo === CREATIVE_COMBO.id) {
      session = null;
      if (timerId) { clearInterval(timerId); timerId = null; }
      return picker(); // в творческом режиме теста нет
    }
    if (hash.includes('?review') && (!session || session.phase !== 'quiz')) {
      if (!startReviewSession()) session = null;
    }
    if (session && session.phase === 'quiz') return quizView();
    if (session && session.phase === 'done') return resultView();
    return picker();
  },

  afterRender() {
    ///topics refresh in picker
    const sel = document.getElementById('sprintSubject');
    const topicSel = document.getElementById('sprintTopic');
    if (sel && topicSel) {
      const fill = () => {
        const sub = SUBJECTS[sel.value];
        const topics = sub ? [...new Set(sub.questions.map(q => bi(q.topic)))] : [];
        topicSel.innerHTML = `<option value="">${esc(t('microTopic'))}: ∗</option>` +
          topics.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
      };
      fill();
      sel.addEventListener('change', fill);
    }
    if (session && session.phase === 'quiz' && !timerId) {
      timerId = setInterval(tick, 1000);
    }
  },

  actions: {
    start() {
      const subjectId = document.getElementById('sprintSubject').value;
      const topic = document.getElementById('sprintTopic').value || null;
      if (!startSession(subjectId, topic)) return;
      window.__rerender();
    },
    answer(el) {
      if (!session || session.answered) return;
      const idx = Number(el.dataset.idx);
      const entry = session.reviewMode ? session.list[session.idx] : null;
      const q = entry ? entry.q : session.list[session.idx];
      const subjectId = entry ? entry.subjectId : session.subjectId;
      session.answered = true;
      session.lastPick = idx;
      const ok = idx === q.answer;
      if (ok) { session.correct += 1; addCorrectPoints(); }
      else { recordError(subjectId, q.id, bi(q.topic)); }
      if (session.reviewMode) {
        // любое засчитанное повторение закрывает ближайший неотмеченный интервал
        const e = load().errors.find(x => x.key === entry.key);
        if (e) { const next = [1, 3, 7, 14].find(d => !e.reviews.includes(d)); if (next) completeReview(entry.key, next); }
      }
      // статистика предмета
      const st = load();
      const s = st.stats[subjectId] || { correct: 0, total: 0 };
      s.total += 1; if (ok) s.correct += 1;
      save({ stats: { ...st.stats, [subjectId]: s } });
      window.__rerender();
    },
    next() {
      if (session.idx + 1 >= session.list.length) finish();
      else { session.idx += 1; session.answered = false; session.lastPick = null; window.__rerender(); }
    },
    again() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      session = null;
      location.hash = '#/sprint';
      window.__rerender();
    },
  },
};
