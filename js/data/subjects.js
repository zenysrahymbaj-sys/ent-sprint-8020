// ============================================================
// Реестр предметов. Каждый предмет — отдельный файл в js/data/subjects/,
// чтобы легко добавлять новое: скопируйте файл, поменяйте id и подключение здесь.
// ============================================================

import { bi } from '../ui.js';
import { MANDATORY, COMBOS } from '../config.js';

import historyKz from './subjects/history-kz.js';
import reading from './subjects/reading.js';
import mathLit from './subjects/math-lit.js';
import math from './subjects/math.js';
import physics from './subjects/physics.js';
import informatics from './subjects/informatics.js';
import geography from './subjects/geography.js';
import biology from './subjects/biology.js';
import chemistry from './subjects/chemistry.js';
import foreignLanguage from './subjects/foreign-language.js';
import worldHistory from './subjects/world-history.js';
import law from './subjects/law.js';
import kazakhLanguage from './subjects/kazakh-language.js';
import russianLanguage from './subjects/russian-language.js';
import kazlit from './subjects/kazlit.js';
import ruslit from './subjects/ruslit.js';

export const SUBJECTS = {
  'history-kz': historyKz,
  'reading': reading,
  'math-lit': mathLit,
  'math': math,
  'physics': physics,
  'informatics': informatics,
  'geography': geography,
  'biology': biology,
  'chemistry': chemistry,
  'foreign-language': foreignLanguage,
  'world-history': worldHistory,
  'law': law,
  'kazakh-language': kazakhLanguage,
  'russian-language': russianLanguage,
  'kazlit': kazlit,
  'ruslit': ruslit,
};

export function subjectName(id) { return bi(SUBJECTS[id]?.name) || id; }

// Название комбинации: «Математика + Физика» / «Математика + Физика» (KZ)
export function comboLabel(comboId) {
  if (comboId === 'creative') return null; // подписывает страница через i18n
  const c = COMBOS.find(x => x.id === comboId);
  if (!c) return comboId;
  return c.subjects.map(subjectName).join(' + ');
}

// Все обязательные id
export const MANDATORY_IDS = MANDATORY.map(m => m.id);
