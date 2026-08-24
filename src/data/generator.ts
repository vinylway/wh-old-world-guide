import { CodexEntry } from '@/data/codex';

export interface StatRow {
  label: string;
  base: number;
  boosted: boolean;
  final: number;
}

export type CareerStatus = 'copper' | 'silver' | 'gold';

export interface GeneratedCharacter {
  id: string;
  name: string;
  originId: string;
  originTitle: string;
  portrait?: string;
  stats: StatRow[];
  experience: number;
  createdAt: number;
  talentIds?: string[];
  boostedSkillIds?: string[];
  loreId?: string;
  loreIds?: string[];
  careerId?: string;
  careerTitle?: string;
  careerStatus?: CareerStatus;
  inDisgrace?: boolean;
  // Навыки, получившие +1 благодаря карьере (выбираются из пула «Бонусы к навыкам»)
  careerSkillAdvances?: string[];
  // Знания, полученные от карьеры (с уточнением варианта — конкретный город, культ и т.п.)
  careerLoreGrants?: LoreGrant[];
  // Информационные заметки о знаниях карьеры, не сводящиеся к конкретной карточке
  // (например «предпочтительное знание вашего бога» у жреца)
  careerLoreNotes?: string[];
  // Знания, полученные от происхождения (с уточнением варианта — конкретный город, культ и т.п.)
  originLoreGrants?: LoreGrant[];
}

export interface LoreGrant {
  loreId: string;
  // Уточнение варианта для знаний-категорий (город/провинция/культ/убийца чудовищ/школа магии)
  variant?: string;
}

// Сохранено для обратной совместимости именования — тип идентичен LoreGrant
export type CareerLoreGrant = LoreGrant;

export interface CareerSkillBonus {
  // Сколько навыков нужно выбрать
  pickCount: number;
  // Пул навыков, из которых можно выбирать (id карточек в разделе «Способности»)
  skillIds: string[];
}

// Русские числительные (дательный и именительный падеж), которые встречаются в тексте
// карьер вида «+1 к четырём из следующих навыков» — нужно для определения, сколько
// навыков разрешено выбрать.
const skillCountWords: Record<string, number> = {
  'одному': 1, 'одного': 1, 'один': 1,
  'двум': 2, 'двух': 2, 'два': 2,
  'трём': 3, 'трем': 3, 'трёх': 3, 'трех': 3, 'три': 3,
  'четырём': 4, 'четырем': 4, 'четырёх': 4, 'четырех': 4, 'четыре': 4,
  'пяти': 5, 'пять': 5,
  'шести': 6, 'шесть': 6,
};

// Извлекает из карьеры структурированный бонус к навыкам (строка «Бонусы к навыкам»):
// сколько навыков выбрать игроку и из какого пула — на основе ссылок на карточки
// навыков, проставленных в этой строке характеристик карьеры.
export const getCareerSkillBonus = (career: CodexEntry | null | undefined): CareerSkillBonus | null => {
  const row = career?.stats?.find((s) => s.label === 'Бонусы к навыкам');
  if (!row?.value) return null;
  const skillIds = (row.links ?? [])
    .filter((l) => !!l.entryId && l.entryId.startsWith('skill-'))
    .map((l) => l.entryId as string);
  if (skillIds.length === 0) return null;
  const match = row.value.toLowerCase().match(/к\s+([а-яё]+)\s+из/);
  const word = match?.[1];
  const pickCount = Math.min(word && skillCountWords[word] ? skillCountWords[word] : 4, skillIds.length);
  return { pickCount, skillIds };
};

// ---------------------------------------------------------------------------
// Знания карьеры («Знание»): часть знаний-«категорий» (Город, Провинция, Культ,
// Убийца чудовищ, Школа магии) требуют дополнительно уточнить конкретный вариант —
// у персонажа не может быть, например, двух разных «Городов», поэтому при выборе
// такого знания игрок указывает конкретное значение (или вписывает своё).
// ---------------------------------------------------------------------------

// Знания-категории, требующие уточнения варианта, и предустановленные варианты для них
export const loreVariantOptions: Record<string, string[]> = {
  'lore-city': [
    'Талагаад', 'Талабхайм', 'Хергиг', 'Равенштайн', 'Кюзель', 'Аленхоф',
    'Нульн', 'Альтдорф', 'Мидденхайм', 'Мариенбург',
  ],
  'lore-province': [
    'Талабекланд', 'Мутланд', 'Хохланд', 'Мидденланд', 'Остланд', 'Штирланд',
    'Рейкланд', 'Вестерланд',
  ],
  'lore-cult': [
    'Таал', 'Райя', 'Ульрик', 'Сигмар', 'Мананн', 'Морр', 'Шалия', 'Верена',
    'Ранальд', 'Мирмидия', 'Гримнир', 'Грунгни', 'Валайя', 'Асуриан', 'Иша',
    'Курноус', 'Лилеат',
  ],
  'lore-monster-slayer': [
    'Убийца ведьм', 'Убийца вампиров', 'Убийца пакостников', 'Убийца троллей',
    'Убийца великанов', 'Убийца драконов', 'Убийца демонов',
  ],
  'lore-magic-school-general': [
    'Боевая магия', 'Элементализм', 'Иллюзионизм', 'Некромантия',
  ],
};

export const isLoreVariantCategory = (loreId: string): boolean => loreId in loreVariantOptions;

// Одна группа знания карьеры: либо конкретное гарантированное знание («лоре-warfare»),
// либо выбор из нескольких вариантов знаний (options.length > 1).
export interface CareerLoreGroup {
  id: string;
  // Варианты знаний (id карточек «lore-*») — если один элемент, знание гарантировано
  options: string[];
}

export interface CareerLoreConfig {
  groups: CareerLoreGroup[];
  // Свободные заметки, которые нельзя свести к конкретной карточке знания
  // (например «предпочтительное знание вашего бога» у жреца)
  notes?: string[];
}

// Разметка знаний по каждой карьере — вручную, на основе текста поля «Знание».
// Учитывает, где запятая разделяет обязательные знания, а где является частью
// перечисления вариантов на выбор.
export const careerLoreConfigs: Record<string, CareerLoreConfig> = {
  'career-apothecary': {
    groups: [
      { id: 'g1', options: ['lore-alchemy'] },
      { id: 'g2', options: ['lore-anatomy', 'lore-zoology'] },
    ],
  },
  'career-thief': {
    groups: [
      { id: 'g1', options: ['lore-criminal-underworld'] },
      { id: 'g2', options: ['lore-city'] },
    ],
  },
  'career-ratcatcher': {
    groups: [
      { id: 'g1', options: ['lore-city'] },
      { id: 'g2', options: ['lore-underground'] },
    ],
  },
  'career-lothern-sea-guard': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
      { id: 'g2', options: ['lore-seafaring'] },
    ],
  },
  'career-knight-errant': {
    groups: [
      { id: 'g1', options: ['lore-literacy'] },
      { id: 'g2', options: ['lore-warfare', 'lore-criminal-underworld'] },
    ],
  },
  'career-scholar': {
    groups: [
      { id: 'g1', options: ['lore-literacy'] },
      {
        id: 'g2',
        options: [
          'lore-high-society', 'lore-anatomy', 'lore-law', 'lore-zoology', 'lore-history', 'lore-accounting',
          'lore-chaos-warriors', 'lore-orc-goblin-tribes', 'lore-risingdead', 'lore-beastmen-herds', 'lore-monster-slayer',
        ],
      },
    ],
  },
  'career-charlatan': {
    groups: [
      { id: 'g1', options: ['lore-criminal-underworld'] },
      { id: 'g2', options: ['lore-high-society', 'lore-cult'] },
    ],
  },
  'career-artisan': {
    groups: [
      { id: 'g1', options: ['lore-blacksmithing', 'lore-art', 'lore-textiles'] },
    ],
    notes: ['Или своё ремесло'],
  },
  'career-engineer': {
    groups: [
      { id: 'g1', options: ['lore-engineering'] },
      { id: 'g2', options: ['lore-blacksmithing'] },
      { id: 'g3', options: ['lore-gunpowder'] },
      { id: 'g4', options: ['lore-literacy'] },
    ],
  },
  'career-shadow-warrior': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
      { id: 'g2', options: ['lore-history'] },
    ],
  },
  'career-labourer': {
    groups: [
      { id: 'g1', options: ['lore-city', 'lore-province'] },
      { id: 'g2', options: ['lore-farming', 'lore-cooking', 'lore-navigable-rivers'] },
    ],
  },
  'career-courtier': {
    groups: [
      { id: 'g1', options: ['lore-high-society'] },
      { id: 'g2', options: ['lore-literacy'] },
      { id: 'g3', options: ['lore-anatomy', 'lore-law', 'lore-zoology', 'lore-history', 'lore-accounting'] },
    ],
  },
  'career-forest-ranger': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
      { id: 'g2', options: ['lore-monster-slayer'] },
    ],
  },
  'career-noble': {
    groups: [
      { id: 'g1', options: ['lore-high-society'] },
      { id: 'g2', options: ['lore-literacy'] },
    ],
  },
  'career-soldier': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
      { id: 'g2', options: ['lore-textiles'] },
      { id: 'g3', options: ['lore-music', 'lore-literacy', 'lore-gunpowder'] },
    ],
  },
  'career-outlaw': {
    groups: [
      { id: 'g1', options: ['lore-province'] },
      { id: 'g2', options: ['lore-criminal-underworld', 'lore-gunpowder'] },
    ],
  },
  'career-priest': {
    groups: [
      { id: 'g1', options: ['lore-cult'] },
      { id: 'g2', options: ['lore-literacy'] },
    ],
    notes: ['Предпочтительное знание вашего бога'],
  },
  'career-artist': {
    groups: [
      { id: 'g1', options: ['lore-city', 'lore-province'] },
      { id: 'g2', options: ['lore-music', 'lore-literacy'] },
    ],
  },
  'career-road-warden': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
    ],
  },
  'career-watchman': {
    groups: [
      { id: 'g1', options: ['lore-city', 'lore-province'] },
    ],
  },
  'career-highway-patrolman': {
    groups: [
      { id: 'g1', options: ['lore-province'] },
      { id: 'g2', options: ['lore-warfare', 'lore-gunpowder', 'lore-forestry'] },
    ],
  },
  'career-sailor': {
    groups: [
      { id: 'g1', options: ['lore-seafaring', 'lore-navigable-rivers'] },
      { id: 'g2', options: ['lore-music', 'lore-gunpowder'] },
    ],
  },
  'career-arcanist': {
    groups: [
      { id: 'g1', options: ['lore-magic-school-general'] },
      { id: 'g2', options: ['lore-literacy'] },
      { id: 'g3', options: ['lore-high-society', 'lore-cult'] },
    ],
  },
  'career-bounty-hunter': {
    groups: [
      { id: 'g1', options: ['lore-province', 'lore-cult'] },
      { id: 'g2', options: ['lore-criminal-underworld', 'lore-monster-slayer'] },
    ],
  },
  'career-ale-warden': {
    groups: [
      { id: 'g1', options: ['lore-province'] },
      { id: 'g2', options: ['lore-cooking', 'lore-accounting'] },
    ],
  },
  'career-witch-doctor': {
    groups: [
      { id: 'g1', options: ['lore-alchemy'] },
      { id: 'g2', options: ['lore-magic-school-general'] },
    ],
  },
  'career-knight': {
    groups: [
      { id: 'g1', options: ['lore-high-society'] },
      { id: 'g2', options: ['lore-warfare'] },
      { id: 'g3', options: ['lore-literacy'] },
    ],
  },
  'career-merchant': {
    groups: [
      { id: 'g1', options: ['lore-city', 'lore-province'] },
      { id: 'g2', options: ['lore-literacy', 'lore-accounting'] },
    ],
  },
  'career-sniper': {
    groups: [
      { id: 'g1', options: ['lore-warfare'] },
      { id: 'g2', options: ['lore-forestry', 'lore-gunpowder', 'lore-music'] },
    ],
  },
  'career-slayer': {
    groups: [
      { id: 'g1', options: ['lore-monster-slayer'] },
      { id: 'g2', options: ['lore-mining', 'lore-forestry', 'lore-seafaring', 'lore-underground', 'lore-navigable-rivers'] },
    ],
    notes: ['Первое знание — обязательно «Убийца троллей», либо любой другой вариант убийцы чудовищ на выбор'],
  },
};

// Возвращает разметку знаний для карьеры (группы гарантированных/выборных знаний и заметки)
export const getCareerLoreConfig = (careerId: string | null | undefined): CareerLoreConfig | null =>
  careerId ? careerLoreConfigs[careerId] ?? null : null;

// Извлекает из карьеры id характеристик (карточки раздела «Способности», подраздел
// «Характеристики»), отмеченных как предпочтительные для этой карьеры — на основе
// ссылок, проставленных в строке «Предпочтительные характеристики».
export const getCareerPreferredAbilityIds = (career: CodexEntry | null | undefined): string[] => {
  const row = career?.stats?.find((s) => s.label === 'Предпочтительные характеристики');
  if (!row?.value) return [];
  return (row.links ?? [])
    .filter((l) => !!l.entryId && l.entryId.startsWith('ability-'))
    .map((l) => l.entryId as string);
};

// Итоговое значение навыка: база 2, плюс бонусы происхождения и карьеры — они суммируются,
// поэтому навык, повышенный и происхождением, и карьерой, может дойти до 4.
export const getSkillLevel = (
  skillId: string,
  boostedSkillIds: string[],
  careerSkillAdvances: string[] = []
): number =>
  2 + (boostedSkillIds.includes(skillId) ? 1 : 0) + (careerSkillAdvances.includes(skillId) ? 1 : 0);

interface OriginRollRange {
  min: number;
  max: number;
  originId: string;
}

// Таблица определения происхождения по броску d10
export const originRollTable: OriginRollRange[] = [
  { min: 1, max: 1, originId: 'o1' }, // Бретонец
  { min: 2, max: 3, originId: 'o4' }, // Гном
  { min: 4, max: 7, originId: 'o2' }, // Имперец
  { min: 8, max: 8, originId: 'o6' }, // Полурослик
  { min: 9, max: 9, originId: 'o3' }, // Высший эльф
  { min: 10, max: 10, originId: 'o5' }, // Лесной эльф
];

export const getOriginIdByRoll = (roll: number): string => {
  const found = originRollTable.find((r) => roll >= r.min && roll <= r.max);
  return found?.originId ?? 'o2';
};

// Таблица «Модификаторов характеристик»: значение d10 → характеристика.
// 10 — свободный выбор игрока среди ещё не усиленных характеристик.
export const characteristicModifierTable: Record<number, string> = {
  1: 'ББ',
  2: 'ДБ',
  3: 'С',
  4: 'В',
  5: 'И',
  6: 'Пр',
  7: 'Р',
  8: 'Х',
  9: 'Судьба',
  10: 'free',
};

export const rollD10 = (): number => Math.floor(Math.random() * 10) + 1;
export const rollD100 = (): number => Math.floor(Math.random() * 100) + 1;

// Соответствие короткой метки характеристики (как в StatRow) её карточке в разделе «Способности»
export const characteristicAbilityEntryId: Record<string, string> = {
  'ББ': 'ability-bb',
  'ДБ': 'ability-db',
  'С': 'ability-s',
  'В': 'ability-v',
  'И': 'ability-i',
  'Пр': 'ability-pr',
  'Р': 'ability-r',
  'Х': 'ability-h',
};

// Таблица «Возможности происхождения» для бретонца (d10)
export const bretonTalentTable: Record<number, string> = {
  1: 'talent-breton-allies-in-arms',
  2: 'talent-breton-defensive-stance',
  3: 'talent-breton-golden-voice',
  4: 'talent-breton-strong-build',
  5: 'talent-breton-resistance-to-corruption',
  6: 'talent-breton-secret-heritage',
  7: 'talent-breton-iron-stomach',
  8: 'talent-breton-helmsman',
  9: 'talent-breton-vanguard',
  10: 'talent-breton-furious-charge',
};

export const bretonOathTalentId = 'talent-breton-oath-of-honour';

// Навыки, которые бретонец обязан поднять до 3 (плюс ещё любые два на выбор игрока)
export const bretonMandatoryBoostedSkillIds = ['skill-melee', 'skill-labour'];

// Базовое знание, которым бретонец владеет от рождения (не требует выбора)
export const bretonBaseLoreId = 'lore-bretonnia';

// Варианты знания от происхождения для бретонца на выбор: «Высший свет» или «Фермерство»
export const bretonLoreChoiceIds = ['lore-high-society', 'lore-farming'];

// ---------------------------------------------------------------------------
// Универсальная конфигурация «Возможностей происхождения» для всех рас.
// ---------------------------------------------------------------------------

export interface LoreChoiceGroup {
  id: string;
  label: string;
  options: string[];
}

export interface OriginAbilityConfig {
  originId: string;
  // Таблица d10 → id таланта
  talentTable: Record<number, string>;
  // Сколько раз бросают d10 по таблице талантов (перебрасывая повторы)
  rollsCount: number;
  // Замена одного из выпавших талантов на фиксированный (Обет чести, Устойчивость к магии и т.п.)
  oathReplacement?: { talentId: string; label: string };
  // true — замена обязательна (нужно выбрать слот); false/undefined — замена по желанию игрока
  oathMandatory?: boolean;
  // Таланты, которые персонаж получает гарантированно, без броска
  fixedTalentIds?: string[];
  // Навыки, автоматически поднимаемые до 3
  mandatorySkillIds: string[];
  // Сколько дополнительных навыков можно выбрать (поднимаются до 3)
  extraSkillsCount: number;
  // Знания, которыми персонаж владеет от рождения (без выбора)
  baseLoreIds: string[];
  // Фиксированные варианты для базовых знаний-категорий (город/провинция/культ и т.п.),
  // которые предопределены происхождением и не требуют выбора игрока —
  // например, у полуросликов провинция всегда «Мутланд».
  baseLoreVariants?: Record<string, string>;
  // Группы знаний на выбор — из каждой группы нужно выбрать один вариант
  loreChoiceGroups: LoreChoiceGroup[];
  namesList: string[];
}

export const dwarfOathTalentId = 'talent-dwarf-resistance-to-magic';
export const elfLightningTalentId = 'talent-lightning-reflexes';

export const bretonNames: string[] = [
  'Жиль', 'Жак', 'Перрен', 'Марсель', 'Рауль', 'Этьен', 'Анри', 'Бертран', 'Одо', 'Томен',
  'Моник', 'Изабо', 'Томасс', 'Перрет', 'Жизель', 'Женевьев', 'Марго', 'Симона', 'Жюльот', 'Беатрис',
];

export const dwarfNames: string[] = [
  'Алрик', 'Кеттри', 'Снорек', 'Хергар', 'Каразин', 'Ульфар', 'Скот', 'Дурегар', 'Градни', 'Нарго',
  'Ленка', 'Бритта', 'Хунни', 'Магдарит', 'Элдрида', 'Кобальта', 'Гронден', 'Фреда', 'Лога', 'Виннифер',
];

export const highElfNames: string[] = [
  'Линкор', 'Аскафин', 'Сенга', 'Ульсамор', 'Дорандрил', 'Илдорик', 'Танмар', 'Селлион', 'Валвинг', 'Тирон',
  'Тиранна', 'Кальдия', 'Лоранель', 'Веспа', 'Тина', 'Аспет', 'Минари', 'Дженна', 'Квеллари', 'Алондра',
];

export const woodElfNames: string[] = [
  'Кэрот', 'Мендас', 'Фенелок', 'Дараху', 'Кинвик', 'Мерток', 'Валахан', 'Лурик', 'Гартот', 'Тралан',
  'Саула', 'Фарлак', 'Морланна', 'Тестра', 'Аварин', 'Скендда', 'Гладвит', 'Эстра', 'Отроли', 'Ханадда',
];

export const halflingNames: string[] = [
  'Горацио (Рэй)', 'Бродерик (Брод)', 'Борегард (Бо)', 'Деметриус (Деми)', 'Корнелиус (Нил)', 'Максимилиан (Макс)',
  'Натаниэль (Нейт)', 'Клементина (Клем)', 'Анна-Лиза (Анн)', 'Франческа (Фран)', 'Эдвардин (Эдди)', 'Имоген (Мо)', 'Александра (Алекс)',
];

export const imperialNames: string[] = [
  'Ларс', 'Готфрид', 'Рейнхард', 'Вольфганг', 'Ультар', 'Фридрих', 'Вальтер', 'Кедрик', 'Дитер', 'Густав',
  'Гертрун', 'Фреда', 'Эрика', 'Ольга', 'Катарина', 'Агнес', 'Лина', 'Ингрид', 'Берта', 'Тора',
];

export const originAbilityConfigs: Record<string, OriginAbilityConfig> = {
  // Бретонец
  o1: {
    originId: 'o1',
    talentTable: bretonTalentTable,
    rollsCount: 2,
    oathReplacement: { talentId: bretonOathTalentId, label: '«Обет чести»' },
    mandatorySkillIds: ['skill-melee', 'skill-labour'],
    extraSkillsCount: 2,
    baseLoreIds: ['lore-bretonnia'],
    loreChoiceGroups: [
      { id: 'breton-lore', label: 'Знание от происхождения', options: ['lore-high-society', 'lore-farming'] },
    ],
    namesList: bretonNames,
  },
  // Гном
  o4: {
    originId: 'o4',
    talentTable: {
      1: 'talent-dwarf-armour-piercing',
      2: 'talent-breton-strong-build',
      3: 'talent-dwarf-hatred',
      4: bretonOathTalentId,
      5: 'talent-dwarf-scrutiny',
      6: 'talent-breton-iron-stomach',
      7: 'talent-dwarf-long-beard',
      8: 'talent-dwarf-night-owl',
      9: 'talent-quick-reload',
      10: 'talent-dwarf-single-minded',
    },
    rollsCount: 2,
    oathReplacement: { talentId: dwarfOathTalentId, label: '«Устойчивость к магии»' },
    oathMandatory: true,
    mandatorySkillIds: ['skill-melee', 'skill-labour', 'skill-resilience', 'skill-willpower'],
    extraSkillsCount: 0,
    baseLoreIds: ['lore-dwarf-holds', 'lore-literacy'],
    loreChoiceGroups: [
      { id: 'dwarf-home', label: 'Родная твердыня', options: ['lore-empire', 'lore-underground'] },
    ],
    namesList: dwarfNames,
  },
  // Высший эльф
  o3: {
    originId: 'o3',
    talentTable: {
      1: 'talent-breton-acrobatic',
      2: 'talent-elf-close-order-drill',
      3: 'talent-elf-excellent-hearing',
      4: 'talent-breton-golden-voice',
      5: 'talent-elf-discerning-eye',
      6: 'talent-elf-savant',
      7: 'talent-breton-secret-heritage',
      8: 'talent-elf-wind-touched',
      9: 'talent-elf-marksman',
      10: 'talent-elf-valour-of-ages',
    },
    rollsCount: 2,
    oathReplacement: { talentId: elfLightningTalentId, label: '«Молниеносная реакция»' },
    oathMandatory: true,
    mandatorySkillIds: ['skill-observation', 'skill-athletics', 'skill-willpower', 'skill-memory'],
    extraSkillsCount: 0,
    baseLoreIds: ['lore-high-elf-kingdoms', 'lore-literacy'],
    loreChoiceGroups: [
      { id: 'high-elf-science', label: 'Наука (на выбор)', options: ['lore-anatomy', 'lore-law', 'lore-zoology', 'lore-history', 'lore-accounting'] },
    ],
    namesList: highElfNames,
  },
  // Лесной эльф
  o5: {
    originId: 'o5',
    talentTable: {
      1: 'talent-breton-acrobatic',
      2: 'talent-careful-aim',
      3: 'talent-elf-close-order-drill',
      4: 'talent-elf-excellent-hearing',
      5: 'talent-feigned-flight',
      6: 'talent-breton-golden-voice',
      7: 'talent-elf-discerning-eye',
      8: 'talent-wood-elf-prankster-sense',
      9: 'talent-elf-wind-touched',
      10: 'talent-breton-vanguard',
    },
    rollsCount: 2,
    oathReplacement: { talentId: elfLightningTalentId, label: '«Молниеносная реакция»' },
    oathMandatory: true,
    mandatorySkillIds: ['skill-survival', 'skill-observation', 'skill-athletics', 'skill-stealth'],
    extraSkillsCount: 0,
    baseLoreIds: ['lore-wood-elf-kingdom', 'lore-forestry'],
    loreChoiceGroups: [
      { id: 'wood-elf-neighbours', label: 'Соседи', options: ['lore-bretonnia', 'lore-beastmen-herds'] },
    ],
    namesList: woodElfNames,
  },
  // Полурослик
  o6: {
    originId: 'o6',
    talentTable: {
      1: 'talent-careful-aim',
      2: 'talent-breton-defensive-stance',
      3: 'talent-feigned-flight',
      4: 'talent-breton-iron-stomach',
      5: 'talent-elf-discerning-eye',
      6: elfLightningTalentId,
      7: 'talent-halfling-fortune',
      8: 'talent-breton-allies-in-arms',
      9: 'talent-wag',
      10: 'talent-breton-vanguard',
    },
    rollsCount: 1,
    fixedTalentIds: ['talent-breton-resistance-to-corruption', 'talent-halfling-small'],
    mandatorySkillIds: ['skill-shooting', 'skill-stealth', 'skill-cunning', 'skill-charm'],
    extraSkillsCount: 0,
    baseLoreIds: ['lore-province', 'lore-cooking'],
    baseLoreVariants: { 'lore-province': 'Мутланд' },
    loreChoiceGroups: [],
    namesList: halflingNames,
  },
  // Имперец
  o2: {
    originId: 'o2',
    talentTable: {
      1: 'talent-elf-excellent-hearing',
      2: 'talent-imperial-faith',
      3: 'talent-breton-strong-build',
      4: 'talent-imperial-camaraderie',
      5: bretonOathTalentId,
      6: 'talent-imperial-savvy',
      7: 'talent-breton-helmsman',
      8: 'talent-wag',
      9: 'talent-quick-reload',
      10: 'talent-elf-wind-touched',
    },
    rollsCount: 2,
    mandatorySkillIds: [],
    extraSkillsCount: 3,
    baseLoreIds: ['lore-empire'],
    loreChoiceGroups: [
      { id: 'imperial-home', label: 'Дом', options: ['lore-city', 'lore-province'] },
    ],
    namesList: imperialNames,
  },
};

interface CareerRollRange {
  min: number;
  max: number;
  careerId: string;
}

// Таблица случайных карьер (d100) для каждого происхождения.
// origin id: o1 — Бретонец, o4 — Гном, o6 — Полурослик, o3 — Высший эльф, o2 — Имперец, o5 — Лесной эльф
export const careerRollTables: Record<string, CareerRollRange[]> = {
  o1: [
    { min: 1, max: 5, careerId: 'career-apothecary' },
    { min: 6, max: 7, careerId: 'career-arcanist' },
    { min: 8, max: 12, careerId: 'career-artisan' },
    { min: 13, max: 17, careerId: 'career-sailor' },
    { min: 18, max: 20, careerId: 'career-bounty-hunter' },
    { min: 21, max: 23, careerId: 'career-outlaw' },
    { min: 24, max: 25, careerId: 'career-charlatan' },
    { min: 26, max: 30, careerId: 'career-courtier' },
    { min: 31, max: 32, careerId: 'career-engineer' },
    { min: 33, max: 37, careerId: 'career-artist' },
    { min: 38, max: 39, careerId: 'career-witch-doctor' },
    { min: 40, max: 47, careerId: 'career-knight' },
    { min: 48, max: 52, careerId: 'career-knight-errant' },
    { min: 53, max: 62, careerId: 'career-labourer' },
    { min: 63, max: 67, careerId: 'career-merchant' },
    { min: 68, max: 69, careerId: 'career-noble' },
    { min: 70, max: 74, careerId: 'career-ratcatcher' },
    { min: 75, max: 79, careerId: 'career-highway-patrolman' },
    { min: 80, max: 82, careerId: 'career-scholar' },
    { min: 83, max: 87, careerId: 'career-sniper' },
    { min: 88, max: 92, careerId: 'career-soldier' },
    { min: 93, max: 95, careerId: 'career-thief' },
    { min: 96, max: 100, careerId: 'career-watchman' },
  ],
  o4: [
    { min: 1, max: 5, careerId: 'career-apothecary' },
    { min: 6, max: 15, careerId: 'career-artisan' },
    { min: 16, max: 17, careerId: 'career-sailor' },
    { min: 18, max: 20, careerId: 'career-bounty-hunter' },
    { min: 21, max: 25, careerId: 'career-ale-warden' },
    { min: 26, max: 27, careerId: 'career-outlaw' },
    { min: 28, max: 29, careerId: 'career-charlatan' },
    { min: 30, max: 32, careerId: 'career-courtier' },
    { min: 33, max: 37, careerId: 'career-engineer' },
    { min: 38, max: 40, careerId: 'career-artist' },
    { min: 41, max: 50, careerId: 'career-labourer' },
    { min: 51, max: 60, careerId: 'career-merchant' },
    { min: 61, max: 62, careerId: 'career-noble' },
    { min: 63, max: 65, careerId: 'career-ratcatcher' },
    { min: 66, max: 67, careerId: 'career-highway-patrolman' },
    { min: 68, max: 70, careerId: 'career-scholar' },
    { min: 71, max: 78, careerId: 'career-sniper' },
    { min: 79, max: 83, careerId: 'career-slayer' },
    { min: 84, max: 93, careerId: 'career-soldier' },
    { min: 94, max: 95, careerId: 'career-thief' },
    { min: 96, max: 100, careerId: 'career-watchman' },
  ],
  o6: [
    { min: 1, max: 10, careerId: 'career-apothecary' },
    { min: 11, max: 15, careerId: 'career-artisan' },
    { min: 16, max: 18, careerId: 'career-sailor' },
    { min: 19, max: 23, careerId: 'career-bounty-hunter' },
    { min: 24, max: 28, careerId: 'career-outlaw' },
    { min: 29, max: 33, careerId: 'career-charlatan' },
    { min: 34, max: 36, careerId: 'career-courtier' },
    { min: 37, max: 38, careerId: 'career-engineer' },
    { min: 39, max: 46, careerId: 'career-artist' },
    { min: 47, max: 56, careerId: 'career-labourer' },
    { min: 57, max: 64, careerId: 'career-merchant' },
    { min: 65, max: 66, careerId: 'career-noble' },
    { min: 67, max: 71, careerId: 'career-ratcatcher' },
    { min: 72, max: 73, careerId: 'career-highway-patrolman' },
    { min: 74, max: 76, careerId: 'career-scholar' },
    { min: 77, max: 84, careerId: 'career-sniper' },
    { min: 85, max: 87, careerId: 'career-soldier' },
    { min: 88, max: 95, careerId: 'career-thief' },
    { min: 96, max: 100, careerId: 'career-watchman' },
  ],
  o3: [
    { min: 1, max: 5, careerId: 'career-apothecary' },
    { min: 6, max: 10, careerId: 'career-arcanist' },
    { min: 11, max: 15, careerId: 'career-artisan' },
    { min: 16, max: 25, careerId: 'career-sailor' },
    { min: 26, max: 28, careerId: 'career-bounty-hunter' },
    { min: 29, max: 30, careerId: 'career-outlaw' },
    { min: 31, max: 32, careerId: 'career-charlatan' },
    { min: 33, max: 37, careerId: 'career-courtier' },
    { min: 38, max: 40, careerId: 'career-artist' },
    { min: 41, max: 43, careerId: 'career-knight' },
    { min: 44, max: 53, careerId: 'career-labourer' },
    { min: 54, max: 58, careerId: 'career-lothern-sea-guard' },
    { min: 59, max: 68, careerId: 'career-merchant' },
    { min: 69, max: 73, careerId: 'career-noble' },
    { min: 74, max: 75, careerId: 'career-highway-patrolman' },
    { min: 76, max: 80, careerId: 'career-scholar' },
    { min: 81, max: 85, careerId: 'career-shadow-warrior' },
    { min: 86, max: 90, careerId: 'career-sniper' },
    { min: 91, max: 95, careerId: 'career-soldier' },
    { min: 96, max: 97, careerId: 'career-thief' },
    { min: 98, max: 100, careerId: 'career-watchman' },
  ],
  o2: [
    { min: 1, max: 5, careerId: 'career-apothecary' },
    { min: 6, max: 6, careerId: 'career-arcanist' },
    { min: 7, max: 14, careerId: 'career-artisan' },
    { min: 15, max: 19, careerId: 'career-sailor' },
    { min: 20, max: 22, careerId: 'career-bounty-hunter' },
    { min: 23, max: 25, careerId: 'career-outlaw' },
    { min: 26, max: 28, careerId: 'career-charlatan' },
    { min: 29, max: 31, careerId: 'career-courtier' },
    { min: 32, max: 33, careerId: 'career-engineer' },
    { min: 34, max: 36, careerId: 'career-artist' },
    { min: 37, max: 39, careerId: 'career-witch-doctor' },
    { min: 40, max: 41, careerId: 'career-knight' },
    { min: 42, max: 51, careerId: 'career-labourer' },
    { min: 52, max: 56, careerId: 'career-merchant' },
    { min: 57, max: 58, careerId: 'career-noble' },
    { min: 59, max: 63, careerId: 'career-priest' },
    { min: 64, max: 68, careerId: 'career-ratcatcher' },
    { min: 69, max: 71, careerId: 'career-highway-patrolman' },
    { min: 72, max: 74, careerId: 'career-scholar' },
    { min: 75, max: 79, careerId: 'career-sniper' },
    { min: 80, max: 87, careerId: 'career-soldier' },
    { min: 88, max: 92, careerId: 'career-thief' },
    { min: 93, max: 100, careerId: 'career-watchman' },
  ],
  o5: [
    { min: 1, max: 8, careerId: 'career-apothecary' },
    { min: 9, max: 13, careerId: 'career-artisan' },
    { min: 14, max: 15, careerId: 'career-sailor' },
    { min: 16, max: 23, careerId: 'career-bounty-hunter' },
    { min: 24, max: 31, careerId: 'career-outlaw' },
    { min: 32, max: 33, careerId: 'career-charlatan' },
    { min: 34, max: 36, careerId: 'career-courtier' },
    { min: 37, max: 39, careerId: 'career-artist' },
    { min: 40, max: 44, careerId: 'career-witch-doctor' },
    { min: 45, max: 46, careerId: 'career-knight' },
    { min: 47, max: 54, careerId: 'career-labourer' },
    { min: 55, max: 59, careerId: 'career-merchant' },
    { min: 60, max: 61, careerId: 'career-noble' },
    { min: 62, max: 64, careerId: 'career-highway-patrolman' },
    { min: 65, max: 67, careerId: 'career-scholar' },
    { min: 68, max: 77, careerId: 'career-sniper' },
    { min: 78, max: 82, careerId: 'career-soldier' },
    { min: 83, max: 85, careerId: 'career-thief' },
    { min: 86, max: 90, careerId: 'career-watchman' },
    { min: 91, max: 95, careerId: 'career-road-warden' },
    { min: 96, max: 100, careerId: 'career-forest-ranger' },
  ],
};

export const getCareerIdByRoll = (originId: string, roll: number): string | null => {
  const table = careerRollTables[originId];
  if (!table) return null;
  const found = table.find((r) => roll >= r.min && roll <= r.max);
  return found?.careerId ?? null;
};

// Статус, который даёт карьера персонажу
const goldCareerIds = ['career-noble', 'career-knight', 'career-courtier'];
const copperCareerIds = [
  'career-apothecary', 'career-sailor', 'career-outlaw', 'career-charlatan', 'career-artist',
  'career-witch-doctor', 'career-labourer', 'career-ratcatcher', 'career-shadow-warrior',
  'career-sniper', 'career-slayer', 'career-thief', 'career-watchman', 'career-road-warden',
  'career-forest-ranger',
];

export const getCareerStatus = (careerId: string): CareerStatus => {
  if (goldCareerIds.includes(careerId)) return 'gold';
  if (copperCareerIds.includes(careerId)) return 'copper';
  return 'silver';
};

export const careerStatusLabels: Record<CareerStatus, string> = {
  copper: 'Медный',
  silver: 'Серебряный',
  gold: 'Золотой',
};

export const careerStatusIcons: Record<CareerStatus, string> = {
  copper: 'Circle',
  silver: 'CircleDot',
  gold: 'CircleDollarSign',
};

// «Жизнь в опале» понижает статус на ступень и даёт дополнительный опыт.
// Медный статус не может опускаться — опала для него недоступна.
export const canDisgrace = (status: CareerStatus): boolean => status !== 'copper';

export const disgracedStatus = (status: CareerStatus): CareerStatus =>
  status === 'gold' ? 'silver' : 'copper';

export const getRandomBretonName = (): string =>
  bretonNames[Math.floor(Math.random() * bretonNames.length)];

export const getRandomNameForOrigin = (originId: string): string => {
  const list = originAbilityConfigs[originId]?.namesList;
  if (!list || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
};

const STORAGE_KEY = 'codex-generated-characters';

export const getSavedCharacters = (): GeneratedCharacter[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeneratedCharacter[]) : [];
  } catch {
    return [];
  }
};

export const saveCharacter = (character: GeneratedCharacter): void => {
  const list = getSavedCharacters();
  list.unshift(character);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const deleteCharacter = (id: string): void => {
  const list = getSavedCharacters().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};