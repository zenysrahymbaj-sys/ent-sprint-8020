// ============================================================
// Движение интерфейса: три независимых эффекта.
//   1) шлейф-подсветка, плавно догоняющая курсор;
//   2) 3D-наклон карточки за курсором + блик внутри неё;
//   3) появление карточек при скролле (IntersectionObserver).
// Всё выключается при prefers-reduced-motion и на тач-устройствах
// (там, где нет hover, наклона и курсора не бывает).
// ============================================================

const MAX_TILT = 9;          // градусов наклона карточки
const LERP = 0.09;           // насколько быстро подсветка догоняет курсор (0..1)

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let glow = null, tx = 0, ty = 0, gx = 0, gy = 0, raf = null;

// ---------- 1. шлейф за курсором ----------
function glowLoop() {
  gx += (tx - gx) * LERP;
  gy += (ty - gy) * LERP;
  glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
  // пока курсор «догоняется» — крутим rAF, иначе засыпаем и не грузим кадр
  raf = Math.hypot(tx - gx, ty - gy) > 0.6 ? requestAnimationFrame(glowLoop) : null;
}

function wakeGlow(x, y) {
  tx = x; ty = y;
  glow.classList.add('on');
  if (!raf) raf = requestAnimationFrame(glowLoop);
}

// ---------- 2. наклон карточки ----------
let tilted = null;

function tilt(card, e) {
  const r = card.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width;   // 0..1 по ширине
  const ny = (e.clientY - r.top) / r.height;   // 0..1 по высоте
  card.classList.add('tilting');
  // наклон против стороны курсора: край «уходит», центр «выдвигается»
  card.style.transform =
    `perspective(1000px) rotateX(${(0.5 - ny) * MAX_TILT}deg) rotateY(${(nx - 0.5) * MAX_TILT}deg) translateZ(0)`;
  card.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`); // блик следует за курсором
  card.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
}

function untilt(card) {
  if (!card) return;
  card.classList.remove('tilting');
  card.style.transform = '';
}

// ---------- 3. появление при скролле ----------
const io = new IntersectionObserver(entries => {
  let step = 0;
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    en.target.style.animationDelay = `${Math.min(step++, 5) * 0.07}s`; // лесенка
    en.target.classList.add('in');
    en.target.dataset.revealed = '1';
    io.unobserve(en.target);
  }
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });

// SPA перерисовывает <main> на каждый переход — заново навешиваем reveal
// на свежие карточки и подписываемся на наклон
function sync() {
  for (const card of document.querySelectorAll('main .card')) {
    if (card.dataset.revealed || card.classList.contains('reveal')) continue;
    card.classList.add('reveal');
    io.observe(card);
  }
}

export function initMotion() {
  if (reduced()) return; // пользователь просил без анимации — ничего не делаем
  // класс-страховка: без него карточки не получают opacity:0, то есть при
  // любой ошибке JS контент остаётся видимым
  document.documentElement.classList.add('js-motion');
  sync();
  new MutationObserver(sync).observe(document.querySelector('main'), { childList: true });

  if (!finePointer()) return; // телефон/планшет: только появление блоков

  glow = document.getElementById('cursorGlow');
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    wakeGlow(e.clientX, e.clientY);
    const card = e.target.closest ? e.target.closest('main .card') : null;
    if (card !== tilted) { untilt(tilted); tilted = card; }
    if (card) tilt(card, e);
  }, { passive: true });

  // курсор ушёл за окно — карточные наклоны и подсветка возвращаются в покой
  document.addEventListener('pointerleave', () => { untilt(tilted); tilted = null; glow.classList.remove('on'); });
  window.addEventListener('blur', () => { untilt(tilted); tilted = null; glow.classList.remove('on'); });
}
