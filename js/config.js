// ============================================================
// НАСТРОЙКИ ЕНТ — все значения формата экзамена и пороги здесь.
// Меняйте без правки остального кода.
// ============================================================

// Формат экзамена
export const EXAM = {
  totalQuestions: 120,   // всего заданий
  maxScore: 140,         // максимальный балл
  durationMin: 240,      // 4 часа
  sprintSeconds: 300,    // 5 минут на спринт
  questionsPerSprint: 5, // микро-тест: 5 заданий
  defaultExamDate: '2027-06-15', // дату можно менять в профиле
};

// Обязательные предметы: id + количество заданий
export const MANDATORY = [
  { id: 'history-kz', questions: 20 },
  { id: 'reading',    questions: 10 }, // Грамотность чтения
  { id: 'math-lit',   questions: 10 }, // Математическая грамотность
];

// Каждый профильный предмет даёт 40 заданий
export const PROFILE_QUESTIONS = 40;

// 12 комбинаций профильных предметов + творческий режим
export const COMBOS = [
  { id: 'math+physics',      subjects: ['math', 'physics'] },
  { id: 'math+informatics',  subjects: ['math', 'informatics'] },
  { id: 'math+geography',    subjects: ['math', 'geography'] },
  { id: 'bio+chemistry',     subjects: ['biology', 'chemistry'] },
  { id: 'bio+geography',     subjects: ['biology', 'geography'] },
  { id: 'fl+world-history',  subjects: ['foreign-language', 'world-history'] },
  { id: 'geography+fl',      subjects: ['geography', 'foreign-language'] },
  { id: 'world-history+law', subjects: ['world-history', 'law'] },
  { id: 'world-history+geo', subjects: ['world-history', 'geography'] },
  { id: 'kk+kazlit',         subjects: ['kazakh-language', 'kazlit'] },
  { id: 'ru+ruslit',         subjects: ['russian-language', 'ruslit'] },
  { id: 'chemistry+physics', subjects: ['chemistry', 'physics'] },
];

// Режим «Творческий экзамен»: без профильных предметов
export const CREATIVE_COMBO = { id: 'creative', subjects: [] };

// Пороги поступления (редактируются в профиле; это значения по умолчанию)
export const DEFAULT_THRESHOLDS = {
  national: 65,        // национальные вузы
  other: 50,           // остальные вузы
  pedagogic_legal: 75, // педагогические и юридические направления
  health: 70,          // здравоохранение
};

// Геймификация
export const GAME = {
  pointsPerCorrect: 10,   // очки за верный ответ
  penaltyPerMissedDay: 20,// потеря очков за пропущенный день
  leagues: [              // порог названия (ключ i18n)
    { min: 0,    key: 'leagueBronze',   icon: '🥉' },
    { min: 300,  key: 'leagueSilver',   icon: '🥈' },
    { min: 1000, key: 'leagueGold',     icon: '🥇' },
    { min: 2500, key: 'leaguePlatinum', icon: '💎' },
  ],
};

// Интервальные повторения (дни)
export const REVIEW_DAYS = [1, 3, 7, 14];
