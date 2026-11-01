// ============================================================
// Предмет: Иностранный язык (ЕНТ / ҰТО).
// Контент v1 — ЧЕРНОВИК: сверяйте с официальной спецификацией НЦТ.
// Тексты вопросов и варианты — на английском (одинаковы в ru и kz),
// topic и explain — двуязычные.
// ============================================================

export default {
  id: 'foreign-language',
  icon: '🗣️',
  mandatory: false, // профильный предмет по выбору
  name: { ru: 'Иностранный язык', kz: 'Шет тілі' },

  // Совет для страницы «Как учиться»: как готовить именно этот предмет
  advice: {
    ru: 'Иностранный язык на ЕНТ проверяет грамматику и лексику по готовым шаблонам: артикли, времена (Present/Past/Future Simple, Perfect), предлоги in/on/at, степени сравнения, much/many, неправильные глаголы. Зубрите связки-маркеры (every day → Present Simple, ago → Past Simple, already/yet → Present Perfect) и решайте по 20 тестовых заданий в день на время.',
    kz: 'ҰТО-да шет тілі дайын қалыптармен тексеріледі: артикль, шақ (Present/Past/Future Simple, Perfect), in/on/at предлогтары, салыстырмалы дәреже, much/many, дұрыс емес етістіктер. Белгі-тіркестерді жатта (every day → Present Simple, ago → Past Simple, already/yet → Present Perfect) әрі күніне уақытты қысып 20 тест тапсырмасын шеш.',
  },

  // 5 карточек-шпаргалок (лицо = title, оборот = back)
  cards: [
    {
      id: 'fl-c1',
      title: { ru: 'Артикли a / an / the', kz: 'a / an / the артиктері' },
      back: {
        ru: 'a — перед согласным звуком (a book, a university: «yu» — согласный звук). an — перед гласным звуком (an egg, an hour: «h» молчит). the — конкретный, уже известный предмет. Множественное и абстрактное часто без артикля: I love music.',
        kz: 'a — дауыссыз дыбыстың алдында (a book, a university: «yu» — дауыссыз дыбыс). an — дауысты дыбыстың алдында (an egg, an hour: «h» айтылмайды). the — нақты, бұрын айтылған зат. Көпше және абстрактілік көбіне артикльсіз: I love music.',
      },
      draft: true,
    },
    {
      id: 'fl-c2',
      title: { ru: 'Present Simple vs Continuous', kz: 'Present Simple / Continuous' },
      back: {
        ru: 'Simple = регулярность/факт (every day, usually, always): She goes to school. Continuous = действие сейчас (now, at the moment): She is going now. Маркер every day → несите -s в 3-м лице.',
        kz: 'Simple = реттілік/факт (every day, usually, always): She goes to school. Continuous = қазіргі іс-әрекет (now, at the moment): She is going now. every day белгісі → 3-жікте -s жалғауын қос.',
      },
      draft: true,
    },
    {
      id: 'fl-c3',
      title: { ru: 'Неправильные глаголы (топ)', kz: 'Дұрыс емес етістіктер (үздік)' },
      back: {
        ru: 'buy–bought–bought · go–went–gone · see–saw–seen · take–took–taken · come–came–come · do–did–done · have–had–had · get–got–got · make–made–made · say–said–said. Учите тройками (V1–V2–V3) — Past Simple и Perfect опираются на них.',
        kz: 'buy–bought–bought · go–went–gone · see–saw–seen · take–took–taken · come–came–come · do–did–done · have–had–had · get–got–got · make–made–made · say–said–said. Үштікпен жатта (V1–V2–V3) — Past Simple мен Perfect осыған сүйенеді.',
      },
      draft: true,
    },
    {
      id: 'fl-c4',
      title: { ru: 'Предлоги времени: in/on/at', kz: 'Уақыт предлогтары: in/on/at' },
      back: {
        ru: 'at — точное время (at 5 o\'clock, at night). on — дни и даты (on Monday, on 5 May). in — месяцы/сезоны/годы и части дня (in July, in winter, in the morning). Дни недели обычно берут on, но есть и другие конструкции: from Monday to Friday, by Monday, on Monday morning — выбирайте предлог по смыслу, а не по шаблону.',
        kz: 'at — нақты уақыт (at 5 o\'clock, at night). on — күн мен дата (on Monday, on 5 May). in — ай/маусым/жыл және күн бөліктері (in July, in winter, in the morning). Апта күндері әдетте on алады, бірақ басқа құрылымдар да бар: from Monday to Friday, by Monday, on Monday morning — предлогті үлгіден емес, мағынадан таңдаңыз.',
      },
      draft: true,
    },
    {
      id: 'fl-c5',
      title: { ru: 'Ловушки much / many', kz: 'Тұзақтар: much / many' },
      back: {
        ru: 'many — с исчисляемыми во мн. ч. (many books, many students). much — с неисчисляемыми (much water, much time). Считается ли поштучно? Да → many, нет → much. After «how» та же логика: how many / how much.',
        kz: 'many — саналатын көпше зат есіммен (many books, many students). much — саналмайтынмен (much water, much time). Данамен санала ма? Иә → many, жоқ → much. «how»-дан кейін де солай: how many / how much.',
      },
      draft: true,
    },
  ],

  // 10 примеров вопросов. answer: индекс правильного варианта (0=A,1=B,2=C,3=D)
  // Текст вопроса и варианты — на английском (одинаковы в ru и kz).
  questions: [
    {
      id: 'fl-q1',
      topic: { ru: 'Артикли', kz: 'Артикльдер' },
      text: {
        ru: 'Choose the correct article: "At the zoo I saw ___ elephant among other animals."',
        kz: 'Дұрыс артикльді таңдаңыз: "At the zoo I saw ___ elephant among other animals."',
      },
      options: {
        ru: ['a', 'the', 'an', '(no article)'],
        kz: ['a', 'the', 'an', '(no article)'],
      },
      answer: 2,
      explain: {
        ru: '«Elephant» начинается с гласного звука, поэтому нужен an. Правило смотрит на звук, а не на букву. «The» не подходит: слон упоминается впервые, он один из многих («among other animals»).',
        kz: '«Elephant» дауысты дыбыстан басталғандықтан an қажет. Ереже әріпке емес, дыбысқа қарайды. «The» жарамсыз: піл алғаш аталып тұр, ол — көптің бірі («among other animals»).',
      },
      draft: true,
    },
    {
      id: 'fl-q2',
      topic: { ru: 'Present Simple', kz: 'Present Simple' },
      text: {
        ru: 'Complete the sentence: "She ___ to school every day."',
        kz: 'Сөйлемді толықтырыңыз: "She ___ to school every day."',
      },
      options: {
        ru: ['goes', 'go', 'going', 'gone'],
        kz: ['goes', 'go', 'going', 'gone'],
      },
      answer: 0,
      explain: {
        ru: '«Every day» — регулярность → Present Simple. В 3-м лице единственного числа (she) добавляем -es: goes.',
        kz: '«Every day» — реттілік → Present Simple. Жекеше жіктің 3-жегінде (she) -es жалғанады: goes.',
      },
      draft: true,
    },
    {
      id: 'fl-q3',
      topic: { ru: 'Предлоги времени', kz: 'Уақыт предлогтары' },
      text: {
        ru: 'Choose the correct preposition: "The meeting is ___ Monday."',
        kz: 'Дұрыс предлогты таңдаңыз: "The meeting is ___ Monday."',
      },
      options: {
        ru: ['at', 'in', 'of', 'on'],
        kz: ['at', 'in', 'of', 'on'],
      },
      answer: 3,
      explain: {
        ru: 'С днями недели используется on (on Monday). at — для часов, in — для месяцев и лет.',
        kz: 'Апта күндерімен on қолданылады (on Monday). at — сағатқа, in — ай мен жылға.',
      },
      draft: true,
    },
    {
      id: 'fl-q4',
      topic: { ru: 'Past Simple (неправильные)', kz: 'Past Simple (дұрыс емес)' },
      text: {
        ru: 'Complete with the Past Simple: "They ___ a new car last year."',
        kz: 'Past Simple-мен толықтырыңыз: "They ___ a new car last year."',
      },
      options: {
        ru: ['buyed', 'buying', 'bought', 'buyen'],
        kz: ['buyed', 'buying', 'bought', 'buyen'],
      },
      answer: 2,
      explain: {
        ru: '«Buy» — неправильный глагол: buy → bought. Формы «buyed» в английском нет.',
        kz: '«Buy» — дұрыс емес етістік: buy → bought. Ағылшын тілінде «buyed» пішіні жоқ.',
      },
      draft: true,
    },
    {
      id: 'fl-q5',
      topic: { ru: 'much / many', kz: 'much / many' },
      text: {
        ru: 'Choose the correct word: "How ___ water do you drink a day?"',
        kz: 'Дұрыс сөзді таңдаңыз: "How ___ water do you drink a day?"',
      },
      options: {
        ru: ['many', 'much', 'long', 'far'],
        kz: ['many', 'much', 'long', 'far'],
      },
      answer: 1,
      explain: {
        ru: '«Water» — неисчисляемое, поэтому much (how much). many только с исчисляемыми во множественном числе.',
        kz: '«Water» — саналмайтын зат есім, сондықтан much (how much). many тек саналатын көпшемен.',
      },
      draft: true,
    },
    {
      id: 'fl-q6',
      topic: { ru: 'Лексика: синоним', kz: 'Лексика: синоним' },
      text: {
        ru: 'Choose the closest meaning: "The task was quite EASY."',
        kz: 'Мағыналас сөзді таңдаңыз: "The task was quite EASY."',
      },
      options: {
        ru: ['hard', 'long', 'boring', 'simple'],
        kz: ['hard', 'long', 'boring', 'simple'],
      },
      answer: 3,
      explain: {
        ru: '«Easy» = не сложный, лёгкий → ближайший синоним «simple». hard — антоним.',
        kz: '«Easy» = қиын емес, жеңіл → ең жақын синоним «simple». hard — антонимі.',
      },
      draft: true,
    },
    {
      id: 'fl-q7',
      topic: { ru: 'Present Perfect', kz: 'Present Perfect' },
      text: {
        ru: "Complete the sentence: \"I ___ my keys, so I can't open the door.\"",
        kz: "Сөйлемді толықтырыңыз: \"I ___ my keys, so I can't open the door.\"",
      },
      options: {
        ru: ['have lost', 'loses', 'am lose', 'will losing'],
        kz: ['have lost', 'loses', 'am lose', 'will losing'],
      },
      answer: 0,
      explain: {
        // Дистракторы заведомо не сочетаются с подлежащим I / с формой глагола,
        // поэтому верный ответ ровно один.
        ru: 'Есть результат в настоящем (не могу открыть) → Present Perfect: have + V3 = have lost. Остальные формы не сочетаются с «I» («loses», «am lose», «will losing» — грамматически невозможны).',
        kz: 'Нәтиже осы шақта көрініп тұр (есікті аша алмаймын) → Present Perfect: have + V3 = have lost. Қалған нұсқалар «I» тікелей бастауышпен қатар жүрмейді («loses», «am lose», «will losing» — грамматикалық тұрғыдан мүмкін емес).',
      },
      draft: true,
    },
    {
      id: 'fl-q8',
      topic: { ru: 'Степени сравнения', kz: 'Салыстырмалы дәреже' },
      text: {
        ru: 'Complete the sentence: "This book is ___ than that one."',
        kz: 'Сөйлемді толықтырыңыз: "This book is ___ than that one."',
      },
      options: {
        ru: ['interesting', 'most interesting', 'interestinger', 'more interesting'],
        kz: ['interesting', 'most interesting', 'interestinger', 'more interesting'],
      },
      answer: 3,
      explain: {
        ru: 'Длинные прилагательные (3+ слога) образуют сравнительную степень через more: more interesting than. Суффикс -er к «interesting» не добавляют.',
        kz: 'Ұзын сын есімдер (3+ буын) салыстырмалы дәрежені more арқылы жасайды: more interesting than. «interesting»-ке -er жалғауы жалғанбайды.',
      },
      draft: true,
    },
    {
      id: 'fl-q9',
      topic: { ru: 'Вопрос с Present Simple', kz: 'Present Simple сұрағы' },
      text: {
        ru: 'Choose the correct auxiliary: "___ you speak French?"',
        kz: 'Дұрыс көмекші етістікті таңдаңыз: "___ you speak French?"',
      },
      options: {
        ru: ['Are', 'Is', 'Does', 'Do'],
        kz: ['Are', 'Is', 'Does', 'Do'],
      },
      answer: 3,
      explain: {
        ru: 'С подлежащим «you» в Present Simple вопрос строится с Do. Does — для he/she/it, Are/Is — с глаголом to be, а здесь смысловой глагол speak.',
        kz: '«you» ілемімен Present Simple сұрағы Do арқылы құрылады. Does — he/she/it-ке, Are/Is — to be етістігімен, ал мұнда мағыналық етістік speak.',
      },
      draft: true,
    },
    {
      id: 'fl-q10',
      topic: { ru: 'Артикли (the)', kz: 'Артикльдер (the)' },
      text: {
        ru: 'Choose the correct article: "I love ___ music of this band."',
        kz: 'Дұрыс артикльді таңдаңыз: "I love ___ music of this band."',
      },
      options: {
        ru: ['a', 'an', 'the', '(no article)'],
        kz: ['a', 'an', 'the', '(no article)'],
      },
      answer: 2,
      explain: {
        ru: 'Речь о конкретной музыке определённой группы («of this band» сужает смысл), поэтому the. Без уточнения было бы «I love music» без артикля.',
        kz: 'Нақты топтың нақты музыкасы туралы («of this band» мағынаны тарылтады), сондықтан the. Нақтаусыз болса «I love music» артикльсіз болар еді.',
      },
      draft: true,
    },
  ],
};
