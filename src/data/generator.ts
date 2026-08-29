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
  // Имущество, полученное от карьеры (id карточек предметов, могут повторяться)
  careerItemIds?: string[];
  // Заметки об имуществе карьеры, не сводящиеся к конкретной карточке
  // (например «оружие с ценой в серебро на выбор» у жреца/солдата)
  careerItemNotes?: string[];
  // Актив карьеры — id выбранной карточки (лаборатория/лавка/ферма и т.п.)
  careerAssetId?: string;
  // Стартовые контакты — два броска d100 по таблицам контактов, доступным карьере
  contacts?: ContactGrant[];
}

export interface LoreGrant {
  loreId: string;
  // Уточнение варианта для знаний-категорий (город/провинция/культ/убийца чудовищ/школа магии)
  variant?: string;
}

// Один розыгранный контакт: таблица (id карточки-таблицы контактов, например «contact-commoners»),
// выпавший бросок d100, итоговый NPC (id карточки конкретного представителя контакта) и текст
// связи с персонажем, определённый тем же броском.
export interface ContactGrant {
  tableId: string;
  roll: number;
  contactEntryId: string;
  relation?: string;
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

// Боги имперского пантеона — единственные варианты, доступные для знания «Культ» у карьеры Жрец
export const imperialCultGodNames = [
  'Таал', 'Райя', 'Ульрик', 'Сигмар', 'Мананн', 'Морр', 'Шалия', 'Верена', 'Ранальд', 'Мирмидия',
];

// Одна группа знания карьеры: либо конкретное гарантированное знание («лоре-warfare»),
// либо выбор из нескольких вариантов знаний (options.length > 1).
export interface CareerLoreGroup {
  id: string;
  // Варианты знаний (id карточек «lore-*») — если один элемент, знание гарантировано.
  // Для динамических групп (dynamicFromGroupId) не используется — варианты вычисляются
  // во время генерации на основе выбора в группе-источнике.
  options: string[];
  // Ограничивает список вариантов знания-категории (например, только имперские боги
  // для «Культа» у Жреца) — без этого поля доступны все варианты из loreVariantOptions
  variantWhitelist?: string[];
  // Если задано — варианты этой группы вычисляются динамически на основе выбранного
  // варианта в группе с этим id (например, «предпочтительное знание вашего бога»
  // зависит от того, какой культ выбран в группе g1)
  dynamicFromGroupId?: string;
}

export interface CareerLoreConfig {
  groups: CareerLoreGroup[];
  // Свободные заметки, которые нельзя свести к конкретной карточке знания
  notes?: string[];
}

// Возвращает id знаний, которые предпочитает выбранный бог — читает строку
// «Предпочтительные знания» с карточки веры (раздел «faith», подраздел = имя бога).
export const getFaithPreferredLoreIds = (entries: CodexEntry[], godName: string): string[] => {
  const faithEntry = entries.find((e) => e.section === 'faith' && e.subgroup === godName);
  if (!faithEntry) return [];
  if (faithEntry.knowledgeEntryIds && faithEntry.knowledgeEntryIds.length > 0) {
    return faithEntry.knowledgeEntryIds;
  }
  const row = faithEntry.stats?.find((s) => s.label === 'Предпочтительные знания');
  if (!row?.links) return [];
  return row.links
    .filter((l) => !!l.entryId && l.entryId.startsWith('lore-'))
    .map((l) => l.entryId as string);
};

// Вычисляет фактический список вариантов знания для группы: для обычных групп —
// это просто group.options, для динамических — пул знаний, которые предпочитает
// бог, выбранный в группе-источнике (dynamicFromGroupId).
export const resolveCareerLoreGroupOptions = (
  entries: CodexEntry[],
  allGroups: CareerLoreGroup[],
  group: CareerLoreGroup,
  selections: Record<string, string>,
  variants: Record<string, string>
): string[] => {
  if (!group.dynamicFromGroupId) return group.options;
  const sourceGroup = allGroups.find((g) => g.id === group.dynamicFromGroupId);
  if (!sourceGroup) return [];
  const isFixed = sourceGroup.options.length === 1;
  const selectedId = isFixed ? sourceGroup.options[0] : selections[sourceGroup.id];
  if (!selectedId) return [];
  const godName = isLoreVariantCategory(selectedId) ? variants[sourceGroup.id] : undefined;
  if (!godName) return [];
  return getFaithPreferredLoreIds(entries, godName);
};

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
      { id: 'g1', options: ['lore-cult'], variantWhitelist: imperialCultGodNames },
      { id: 'g2', options: ['lore-literacy'] },
      { id: 'g3', options: [], dynamicFromGroupId: 'g1' },
    ],
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

// ---------------------------------------------------------------------------
// Имущество карьеры («Имущество»): по аналогии со знаниями, каждая карьера
// размечена вручную группами предметов — гарантированные (options.length === 1)
// и на выбор. В отличие от знаний, предметы МОГУТ повторяться (например, у
// Истребителя «второй топор»), поэтому дедупликации между группами нет.
// ---------------------------------------------------------------------------

export interface CareerItemGroup {
  id: string;
  // Варианты предметов (id карточек «i*») — если один элемент, предмет гарантирован.
  // Порядковый номер повторяющегося id (например, топор дважды) — это два элемента
  // с одинаковым itemId, но разными ключами через дублирование id в массиве допустимо,
  // де-факто рендерится как один и тот же выбор, поэтому для «второй такой же предмет»
  // используется отдельная гарантированная группа с тем же itemId.
  options: string[];
}

export interface CareerItemConfig {
  groups: CareerItemGroup[];
  // Свободные заметки, которые нельзя свести к конкретной карточке предмета
  // (например «оружие с ценой в серебро на выбор» у жреца/солдата)
  notes?: string[];
}

// Разметка имущества по каждой карьере — вручную, на основе текста поля «Имущество».
export const careerItemConfigs: Record<string, CareerItemConfig> = {
  'career-apothecary': {
    groups: [
      { id: 'g1', options: ['i10', 'i11'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i12'] },
      { id: 'g4', options: ['i9'] },
      { id: 'g5', options: ['i13'] },
    ],
  },
  'career-ale-warden': {
    groups: [
      { id: 'g1', options: ['i23', 'i26'] },
      { id: 'g2', options: ['i38'] },
      { id: 'g3', options: ['i1'] },
      { id: 'g4', options: ['i69', 'i58'] },
    ],
  },
  'career-arcanist': {
    groups: [
      { id: 'g1', options: ['i20'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i7'] },
      { id: 'g4', options: ['i66'] },
      { id: 'g5', options: ['i72'] },
    ],
  },
  'career-artisan': {
    groups: [
      { id: 'g1', options: ['i26', 'i25'] },
      { id: 'g2', options: ['i7'] },
      { id: 'g3', options: ['i9'] },
    ],
    notes: ['Ремесленные инструменты для вашего знания ремесла'],
  },
  'career-artist': {
    groups: [
      { id: 'g1', options: ['items-custom-1787086108780'] },
      { id: 'g2', options: ['i48'] },
      { id: 'g3', options: ['i54'] },
      { id: 'g4', options: ['i73'] },
      { id: 'g5', options: ['i63', 'i72'] },
    ],
  },
  'career-bounty-hunter': {
    groups: [
      { id: 'g1', options: ['i36', 'i38'] },
      { id: 'g2', options: ['i23', 'i25'] },
      { id: 'g3', options: ['i47'] },
      { id: 'g4', options: ['i1'] },
      { id: 'g5', options: ['i68', 'i76'] },
    ],
  },
  'career-charlatan': {
    groups: [
      { id: 'g1', options: ['items-custom-1787086108780'] },
      { id: 'g2', options: ['i51'] },
      { id: 'g3', options: ['i7'] },
      { id: 'g4', options: ['i52'] },
      { id: 'g5', options: ['i53'] },
      { id: 'g6', options: ['i65', 'i73', 'i71'] },
    ],
  },
  'career-courtier': {
    groups: [
      { id: 'g1', options: ['i25', 'i23'] },
      { id: 'g2', options: ['i1', 'i52'] },
      { id: 'g3', options: ['i73'] },
      { id: 'g4', options: ['i72'] },
    ],
  },
  'career-engineer': {
    groups: [
      { id: 'g1', options: ['i25', 'i26'] },
      { id: 'g2', options: ['i39', 'i40'] },
      { id: 'g3', options: ['i7'] },
      { id: 'g4', options: ['i9'] },
      { id: 'g5', options: ['i64'] },
      { id: 'g6', options: ['i62'] },
      { id: 'g7', options: ['i72'] },
    ],
  },
  'career-forest-ranger': {
    groups: [
      { id: 'g1', options: ['i31'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i1'] },
      { id: 'g4', options: ['i14'] },
      { id: 'g5', options: ['i68', 'i55', 'i76'] },
    ],
  },
  'career-highway-patrolman': {
    groups: [
      { id: 'g1', options: ['i37', 'i38', 'i39'] },
      { id: 'g2', options: ['i22', 'i56'] },
      { id: 'g3', options: ['i25'] },
      { id: 'g4', options: ['i12'] },
      { id: 'g5', options: ['i69', 'i68', 'i62'] },
    ],
  },
  'career-knight': {
    groups: [
      { id: 'g1', options: ['i35', 'i34', 'i32', 'i33'] },
      { id: 'g2', options: ['i25'] },
      { id: 'g3', options: ['i55'] },
      { id: 'g4', options: ['i56'] },
    ],
  },
  'career-knight-errant': {
    groups: [
      { id: 'g1', options: ['i35', 'i34', 'i32', 'i33'] },
      { id: 'g2', options: ['i25'] },
      { id: 'g3', options: ['i55'] },
      { id: 'g4', options: ['i56'] },
    ],
  },
  'career-labourer': {
    groups: [
      { id: 'g1', options: ['i23', 'items-custom-1787086108780'] },
      { id: 'g2', options: ['i51'] },
      { id: 'g3', options: ['i9', 'i12'] },
      { id: 'g4', options: ['i68'] },
    ],
    notes: ['Либо ремесленные инструменты для вашего знания ремесла вместо охотничьего набора'],
  },
  'career-lothern-sea-guard': {
    groups: [
      { id: 'g1', options: ['i21'] },
      { id: 'g2', options: ['i36'] },
      { id: 'g3', options: ['i55'] },
      { id: 'g4', options: ['i1'] },
      { id: 'g5', options: ['i14'] },
    ],
  },
  'career-merchant': {
    groups: [
      { id: 'g1', options: ['items-custom-1787086108780'] },
      { id: 'g2', options: ['i1', 'i7'] },
      { id: 'g3', options: ['i72', 'i73'] },
    ],
  },
  'career-noble': {
    groups: [
      { id: 'g1', options: ['i25', 'i23'] },
      { id: 'g2', options: ['i37', 'i38'] },
      { id: 'g3', options: ['i1'] },
      { id: 'g4', options: ['i52'] },
      { id: 'g5', options: ['i73'] },
    ],
  },
  'career-outlaw': {
    groups: [
      { id: 'g1', options: ['i23', 'i25'] },
      { id: 'g2', options: ['i23', 'i55'] },
      { id: 'g3', options: ['i38', 'i39', 'i41'] },
      { id: 'g4', options: ['i1'] },
      { id: 'g5', options: ['i65', 'i69', 'i62'] },
    ],
  },
  'career-priest': {
    groups: [
      { id: 'g1', options: [] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i12', 'i1'] },
      { id: 'g4', options: ['i69', 'i72'] },
    ],
    notes: ['Оружие с ценой в серебро — на выбор игрока из подходящих оружейных карточек'],
  },
  'career-ratcatcher': {
    groups: [
      { id: 'g1', options: ['i21', 'i10'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i51'] },
      { id: 'g4', options: ['i67'] },
      { id: 'g5', options: ['i68'] },
    ],
  },
  'career-road-warden': {
    groups: [
      { id: 'g1', options: ['i37'] },
      { id: 'g2', options: ['i25'] },
      { id: 'g3', options: ['i12'] },
      { id: 'g4', options: ['i69'] },
      { id: 'g5', options: ['i68'] },
    ],
  },
  'career-sailor': {
    groups: [
      { id: 'g1', options: ['i23', 'i25'] },
      { id: 'g2', options: ['i36', 'i39'] },
      { id: 'g3', options: ['i12'] },
      { id: 'g4', options: ['i1', 'i68', 'i62'] },
    ],
  },
  'career-scholar': {
    groups: [
      { id: 'g1', options: ['items-custom-1787086108780'] },
      { id: 'g2', options: ['i72'] },
      { id: 'g3', options: ['i7'] },
      { id: 'g4', options: ['i1', 'i74'] },
    ],
  },
  'career-shadow-warrior': {
    groups: [
      { id: 'g1', options: ['i37'] },
      { id: 'g2', options: ['i25'] },
      { id: 'g3', options: ['i14'] },
      { id: 'g4', options: ['i1'] },
      { id: 'g5', options: ['i69'] },
    ],
  },
  'career-slayer': {
    groups: [
      { id: 'g1', options: ['i23'] },
      { id: 'g2', options: ['i32', 'i23'] },
    ],
    notes: ['Второй вариант — либо двуручный топор, либо ещё один обычный топор'],
  },
  'career-sniper': {
    groups: [
      { id: 'g1', options: ['i37', 'i38', 'i40'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i12'] },
      { id: 'g4', options: ['i69'] },
      { id: 'g5', options: ['i68', 'i62'] },
    ],
  },
  'career-soldier': {
    groups: [
      { id: 'g1', options: ['i25', 'i26', 'i27', 'i28', 'i29', 'i30', 'i15', 'i31', 'i32'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i55'] },
      { id: 'g4', options: ['i1'] },
      { id: 'g5', options: ['i14'] },
      { id: 'g6', options: ['i59'] },
      { id: 'g7', options: ['i65', 'i63', 'i62'] },
    ],
  },
  'career-thief': {
    groups: [
      { id: 'g1', options: ['items-custom-1787086108780'] },
      { id: 'g2', options: ['i48'] },
      { id: 'g3', options: ['i51'] },
      { id: 'g4', options: ['i53'] },
      { id: 'g5', options: ['i71'] },
    ],
  },
  'career-watchman': {
    groups: [
      { id: 'g1', options: ['i19', 'items-custom-1787086108780', 'i20', 'i21', 'i22', 'i23', 'i24', 'i25', 'i26', 'i27', 'i28', 'i29', 'i30', 'i15', 'i31', 'i32'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i1'] },
      { id: 'g4', options: ['i14'] },
      { id: 'g5', options: ['i67'] },
    ],
  },
  'career-witch-doctor': {
    groups: [
      { id: 'g1', options: ['i20'] },
      { id: 'g2', options: ['items-custom-1787086108780'] },
      { id: 'g3', options: ['i51'] },
      { id: 'g4', options: ['i53'] },
      { id: 'g5', options: ['i66'] },
      { id: 'g6', options: ['i13'] },
    ],
  },
};

// Возвращает разметку имущества для карьеры (группы гарантированных/выборных предметов)
export const getCareerItemConfig = (careerId: string | null | undefined): CareerItemConfig | null =>
  careerId ? careerItemConfigs[careerId] ?? null : null;

// ---------------------------------------------------------------------------
// Активы карьеры («Активы»): по аналогии с имуществом, но всегда одна группа —
// выбор одного варианта из нескольких (лаборатория/пивоварня/лавка и т.п.).
// ---------------------------------------------------------------------------

export interface CareerAssetConfig {
  // Варианты активов (id карточек предметов) — игрок выбирает один
  options: string[];
  // Свободная заметка, если часть текста не сводится к конкретной карточке
  notes?: string[];
}

// Разметка активов по каждой карьере — вручную, на основе текста поля «Активы».
export const careerAssetConfigs: Record<string, CareerAssetConfig> = {
  'career-ale-warden': { options: ['items-custom-1787341310872', 'asset-brewery', 'items-custom-1787342798303'] },
  'career-apothecary': { options: ['asset-laboratory', 'asset-brewery', 'asset-shop'] },
  'career-arcanist': { options: ['items-custom-1787341982929', 'items-custom-1787343024083', 'items-custom-1787343128055'] },
  'career-artisan': { options: ['items-custom-1787340910895', 'items-custom-1787340750830', 'asset-shop'] },
  'career-artist': { options: ['items-custom-1787341702275', 'items-custom-1787338113767', 'items-custom-1787342706990'] },
  'career-bounty-hunter': { options: ['items-custom-1787339776208', 'items-custom-1787341901971', 'items-custom-1787341743346'] },
  'career-charlatan': { options: ['items-custom-1787341743346', 'items-custom-1787342706990', 'items-custom-1787342897086'] },
  'career-courtier': { options: ['items-custom-1787342020895', 'items-custom-1787342897086', 'items-custom-1787339776208'] },
  'career-engineer': { options: ['items-custom-1787340910895', 'items-custom-1787340750830', 'items-custom-1787339776208'] },
  'career-forest-ranger': { options: ['items-custom-1787341743346', 'items-custom-1787342864715', 'items-custom-1787342971942'] },
  'career-highway-patrolman': { options: ['items-custom-1787339776208', 'items-custom-1787340011347', 'items-custom-1787342897086'] },
  'career-knight': { options: ['items-custom-1787339776208', 'items-custom-1787342058968', 'items-custom-1787343099234'] },
  'career-knight-errant': { options: ['items-custom-1787339776208', 'items-custom-1787338511885', 'items-custom-1787342864715'] },
  'career-labourer': { options: ['items-custom-1787340302424', 'items-custom-1787340542857', 'items-custom-1787337802721'] },
  'career-lothern-sea-guard': { options: ['items-custom-1787338511885', 'items-custom-1787340750830', 'items-custom-1787342864715'] },
  'career-merchant': { options: ['asset-shop', 'items-custom-1787343072945', 'items-custom-1787337913632'] },
  'career-noble': { options: ['items-custom-1787342122734', 'items-custom-1787340011347', 'items-custom-1787343128055'] },
  'career-outlaw': { options: ['items-custom-1787341743346', 'items-custom-1787339776208', 'items-custom-1787342864715'] },
  'career-priest': { options: ['items-custom-1787341818149', 'items-custom-1787341901971', 'items-custom-1787342897086'] },
  'career-ratcatcher': { options: ['items-custom-1787335232911', 'items-custom-1787340542857', 'items-custom-1787342798303'] },
  'career-road-warden': { options: ['items-custom-1787341743346', 'items-custom-1787342936324', 'items-custom-1787342971942'] },
  'career-sailor': { options: ['items-custom-1787338240721', 'items-custom-1787338375725', 'items-custom-1787338511885'] },
  'career-scholar': { options: ['items-custom-1787341982929', 'items-custom-1787343046984', 'items-custom-1787343024083'] },
  'career-shadow-warrior': { options: ['items-custom-1787341743346', 'items-custom-1787338511885', 'items-custom-1787342864715'] },
  'career-slayer': { options: ['items-custom-1787341818149', 'items-custom-1787342798303', 'items-custom-1787343128055'] },
  'career-sniper': { options: ['items-custom-1787340750830', 'items-custom-1787341743346', 'items-custom-1787342864715'] },
  'career-soldier': { options: ['items-custom-1787341943308', 'items-custom-1787340750830', 'items-custom-1787342864715'] },
  'career-thief': { options: ['items-custom-1787341743346', 'items-custom-1787342706990', 'items-custom-1787342798303'] },
  'career-watchman': { options: ['items-custom-1787340750830', 'items-custom-1787342897086', 'items-custom-1787342864715'] },
  'career-witch-doctor': { options: ['items-custom-1787341743346', 'items-custom-1787342706990', 'items-custom-1787341818149'] },
};

// Возвращает разметку актива для карьеры (варианты на выбор)
export const getCareerAssetConfig = (careerId: string | null | undefined): CareerAssetConfig | null =>
  careerId ? careerAssetConfigs[careerId] ?? null : null;

// ---------------------------------------------------------------------------
// Контакты («Контакты»): при определении стартовых контактов игрок дважды бросает
// d100 по одной или двум таблицам контактов, доступным карьере (можно оба раза по
// одной и той же таблице). Каждая таблица — 5 представителей по 20 диапазонов.
// ---------------------------------------------------------------------------

interface ContactRollRange {
  min: number;
  max: number;
  contactEntryId: string;
  // Тексты связи с персонажем для под-диапазонов внутри диапазона представителя
  // (обычно 4 варианта по 5 очков) — ключ «min-max», значение — текст связи
  relations: Record<string, string>;
}

// Таблицы контактов — id карточек конкретных представителей (раздел «Контакты» в кодексе,
// заполняются/переопределяются через редактор ГМ-раздела, поэтому entries тут не участвуют)
// и тексты связи с персонажем для каждого под-диапазона броска d100.
export const contactRollTables: Record<string, ContactRollRange[]> = {
  // Вельможи
  'abilities-custom-1788002354610': [
    {
      min: 1, max: 20, contactEntryId: 'contacts-custom-1788005036089', // Баронесса Каролина фон Кассель
      relations: {
        '1-5': 'Вы можете унаследовать часть их господства, если докажете свою ценность в их глазах',
        '6-10': 'Вы разделили напиток в миттерфест или в другой день; они надеются, что эта традиция сохранится',
        '11-15': 'Вы — их доверенное лицо, тайный исполнитель их воли, знающий то, что недоступно никому другому',
        '16-20': 'Ранее вы были постоянным членом их свиты и доверенным советником, но ушли в отставку после громкого скандала',
      },
    },
    {
      min: 21, max: 40, contactEntryId: 'contacts-custom-1788005079598', // Гизельберт Альмайда
      relations: {
        '21-25': 'Они утверждают, что у вас есть мистическая связь с восемью Ветрами, поэтому они пристально следят за вами',
        '26-30': 'Вы связали их с влиятельным покровителем, чтобы они могли заниматься магией, не опасаясь преследований',
        '31-35': 'Вы помогаете им находить редкие артефакты, которые углубляют их понимание магии',
        '36-40': 'Их магия спасла вас от ужасной участи в одну из ночей Гехаймниснахта или в иной знаменательный час',
      },
    },
    {
      min: 41, max: 60, contactEntryId: 'contacts-custom-1788005094033', // Амброзия Ваксвинг (Свиристель)
      relations: {
        '41-45': 'Они платят вам за информацию, будь то местные сплетни или свитки из великой библиотеки Альтдорфа',
        '46-50': 'Они постепенно передают вам все свои знания, чтобы вы могли продолжить их дело',
        '51-55': 'Вы обмениваетесь информацией на взаимовыгодной основе, создавая собственные отдельные хранилища знаний',
        '56-60': 'Вам нравится обсуждать тонкости малоизвестных фактов, которые ставят всех остальных в тупик',
      },
    },
    {
      min: 61, max: 80, contactEntryId: 'contacts-custom-1788005115571', // Эсилла Серет
      relations: {
        '61-65': 'Вы оказались втянуты в их грязные игры, от запрещённого поклонения до заговора против графа Мидденхайма',
        '66-70': 'Вы — надёжный шпион, щедро вознаграждаемый за раскрытые тайны',
        '71-75': 'Когда вы были в отчаянии, их интриги спасли вас — теперь вы у них в долгу, что делает вас полезным',
        '76-80': 'Вас шантажируют, чтобы вы служили их политическим целям, и если вы откажетесь, ваша жизнь будет разрушена',
      },
    },
    {
      min: 81, max: 100, contactEntryId: 'contacts-custom-1788005131584', // Хорст фон Шметтох
      relations: {
        '81-85': 'Вы — один из немногих оставшихся друзей при дворе — им нужна ваша помощь, чтобы вернуться в высшее общество',
        '86-90': 'Они — ваши старые друзья — вы рискуете своей репутацией, чтобы разделить с ними трапезу в фестаг или в другие дни',
        '91-95': 'Их падение произошло до вашей встречи, и именно вы помогли им подняться со дна, когда все остальные отвернулись',
        '96-100': 'Их позор бросил тень и на вас, и теперь вы тоже оказались в политической опале',
      },
    },
  ],
  // Сослуживцы
  'abilities-custom-1788002389665': [
    {
      min: 1, max: 20, contactEntryId: 'contacts-custom-1788005150616', // Лорд-охотник Леонард ван Обельманн
      relations: {
        '1-5': 'Они проигнорировали ваш совет и в результате проиграли важную битву — вы не упускаете случая напомнить им об этом',
        '6-10': 'Они видят в вас прирождённого лидера и надеются направить вас к командной должности',
        '11-15': 'Вы были врагами на полях сражений, пока они не предложили вам возможность перейти на их сторону',
        '16-20': 'Вы ослушались их приказа, но они снизошли до того, чтобы не отправлять вас на виселицу',
      },
    },
    {
      min: 21, max: 40, contactEntryId: 'contacts-custom-1788005177723', // Лейтенант Даня Клосснер
      relations: {
        '21-25': 'Вы — их доверенный заместитель, предлагающий советы и претворяющий их решения в жизнь',
        '26-30': 'Вы спасли им жизнь в бою, и они пообещали отплатить за этот долг',
        '31-35': 'Вы провели вместе немало ночей, забыв о званиях, возможно, деля на двоих лучший эль Бугмана или худшего Талабека',
        '36-40': 'Вы не признаёте их авторитета и постоянно ставите под сомнение их решения, но они ценят вашу прямоту и независимость',
      },
    },
    {
      min: 41, max: 60, contactEntryId: 'contacts-custom-1788005206338', // Манфреда Сковгаард
      relations: {
        '41-45': 'Вам довелось сражаться плечом к плечу, чтобы сокрушить общего врага',
        '46-50': 'Они видят в вас достойного преемника и надеются, что вы пойдёте по их пути',
        '51-55': 'Вас сблизила общая неприязнь к бессмысленным правилам и придиркам трусливых офицеров',
        '56-60': 'Ваши встречи полны рассказов о былых и свежих победах, и каждый из вас стремится затмить достижения другого',
      },
    },
    {
      min: 61, max: 80, contactEntryId: 'contacts-custom-1788005222490', // Кокс Фламмери
      relations: {
        '61-65': 'Вы были рядом с ними и в хорошие, и в плохие времена, не задумываясь, следуя их пути сквозь огонь и воду',
        '66-70': 'Они спасли вас, возможно, из самой чащи Драквальда или из проклятых Бесплодных холмов, и никогда не дают вам об этом забыть',
        '71-75': 'Они рассказывают вам завораживающие истории о большом мире, некоторые из которых даже правдивы',
        '76-80': 'Они застали вас за каким-то предосудительным занятием, но пока хранят молчание',
      },
    },
    {
      min: 81, max: 100, contactEntryId: 'contacts-custom-1788005233489', // Розамунда Немевич
      relations: {
        '81-85': 'Они рассказывают вам свои душераздирающие военные истории и рады вашей компании',
        '86-90': 'Вы уважаете их поступки, а они, в свою очередь, уважают вас и помогают, когда могут',
        '91-95': 'Орки, мародёры Хаоса или солдаты вражеской провинции — вы сражались с одними и теми же врагами, что вас и сблизило',
        '96-100': 'Ваши слова причинили им боль, и теперь вы искренне сожалеете и ищете способ исправить содеянное',
      },
    },
  ],
  // Простолюдины
  'contact-commoners': [
    {
      min: 1, max: 20, contactEntryId: 'contacts-custom-1788005252950', // Юрий Каган
      relations: {
        '1-5': 'Вы приносите им свежий хлеб в бекерстаг или в другие дни, обмениваясь историями и сплетнями перед уходом',
        '6-10': 'Их мудрость помогает вам найти ответы на вопросы, которые вы никогда бы не подумали задать',
        '11-15': 'С самого детства они оберегают вас, но причина их заботы остаётся для вас загадкой',
        '16-20': 'Они прощают вашу дерзость, видя в вас отголоски собственного бунтарского прошлого',
      },
    },
    {
      min: 21, max: 40, contactEntryId: 'contacts-custom-1788005275596', // Амелинда Хертвир
      relations: {
        '21-25': 'Вы исповедовали им свои самые тяжкие грехи, получив отпущение',
        '26-30': 'Вы вместе прошли огонь и воду, прежде чем они нашли свой путь, оставив в прошлом все беззаботные приключения',
        '31-35': 'Вы часто спорите о духовном, но вам нравится этот интеллектуальный поединок',
        '36-40': 'Они благословляют вас или ваш дом в Гехаймниснахт или в других случаях, когда вам угрожают тёмные силы',
      },
    },
    {
      min: 41, max: 60, contactEntryId: 'contacts-custom-1788005291404', // Торди Трондоттир
      relations: {
        '41-45': 'Они создали для вас кое-что — крепкий клинок, искусно сделанное кольцо — и вы всё ещё в долгу перед ними за это',
        '46-50': 'Вы что-то им продавали, будь то хорошее железо, кемпербадский бренди или просто свой труд',
        '51-55': 'Они брали вас в подмастерья — у вас не получилось, но вы расстались друзьями',
        '56-60': 'Вы по неосторожности навредили их работе и стараетесь за это искупить вину',
      },
    },
    {
      min: 61, max: 80, contactEntryId: 'contacts-custom-1788005303111', // Лотти Бабкина
      relations: {
        '61-65': 'Спасли ли вы их от набега гоблинов или от бушующего огня, в их заведении вам всегда рады',
        '66-70': 'Однажды вы оказались заперты в их заведении, возможно, из-за непогоды или осады зверолюдов',
        '71-75': 'Им нужна ваша помощь, чтобы их заведение продолжало работать, иначе оно обанкротится',
        '76-80': 'Вы всё ещё должны им за проблемы, которые причинили во время своего последнего визита',
      },
    },
    {
      min: 81, max: 100, contactEntryId: 'contacts-custom-1788005323576', // Олена Дженеццо
      relations: {
        '81-85': 'Какое бы лечение они ни применили — настойка из шлафенкраута или щепотка таррабета — это спасло вам жизнь',
        '86-90': 'Они предоставляют вам эффективное лечение от хронической болезни',
        '91-95': 'Они не смогли спасти вашего близкого, но вы знаете, что они сделали всё возможное',
        '96-100': 'Они диагностировали у вас что-то неизлечимое — предположительно, это однажды вас убьёт',
      },
    },
  ],
  // Странники
  'contact-wanderers': [
    {
      min: 1, max: 20, contactEntryId: 'contacts-custom-1788005339415', // Хайме де Сабатин
      relations: {
        '1-5': 'Вы уже некоторое время следите за их карьерой, черпая вдохновение в их приключениях',
        '6-10': 'Вы обмениваетесь информацией о том, где можно найти возможности для приключений',
        '11-15': 'Ваше предыдущее сотрудничество завершилось подставой, но никто из вас не обиделся',
        '16-20': 'Возможно, сами того не зная, вы помогли им украсть что-то ценное — хемрийские свитки или перстень герцога',
      },
    },
    {
      min: 21, max: 40, contactEntryId: 'contacts-custom-1788005355569', // Вилдарок Стремительный всадник
      relations: {
        '21-25': 'Благодаря их доставкам вы поддерживаете связь с любимым человеком на расстоянии',
        '26-30': 'Вы первый, кому они рассказывают что-то скандальное',
        '31-35': 'Всё, что вы скажете, разносится ими по всему свету — и вы знаете, как это обернуть себе на пользу',
        '36-40': 'Они узнали о вас нечто постыдное и сохранили это в секрете',
      },
    },
    {
      min: 41, max: 60, contactEntryId: 'contacts-custom-1788005368341', // Малько Матаска
      relations: {
        '41-45': 'В минуты сомнений они дают вам мудрый совет и помогают выбрать правильный путь',
        '46-50': 'Каждый Гехаймниснахт они видят вас в своих пророчествах и пытаются разгадать смысл этого знамения',
        '51-55': 'Ваша дружба зародилась задолго до того, как вам открылись их необычайные способности',
        '56-60': 'Вы прошли с ними через битвы и знаете, чего стоит их гнев',
      },
    },
    {
      min: 61, max: 80, contactEntryId: 'contacts-custom-1788005377963', // Гругинн Докрилсон
      relations: {
        '61-65': 'Ради вас они пересекут весь Старый Свет, будь то вниз по Талабеку или через Серые горы, но, само собой, за вознаграждение',
        '66-70': 'Вы сообщаете им о том, где можно найти «товар», в обмен на услуги',
        '71-75': 'Сначала они вас обворовали, потом вы их — и в итоге вы нашли общий язык',
        '76-80': 'Когда-то вы были подельниками и вместе ходили на дело',
      },
    },
    {
      min: 81, max: 100, contactEntryId: 'contacts-custom-1788005395922', // Валда Крахт
      relations: {
        '81-85': 'В глубине души вы разделяете их крамольные взгляды, хотя и скрываете это от других',
        '86-90': 'Их религиозные взгляды вам чужды, но вы не считаете это поводом для казни — вы помогаете им, чем можете',
        '91-95': 'Будь то фанатик Сигмара, Ахальта Пьющего или ещё более странных богов — вы верите, что можете спасти их',
        '96-100': 'Они помогают вам, потому что убеждены, что однажды вы присоединитесь к ним... или умрёте',
      },
    },
  ],
  // Соль земли
  'abilities-custom-1788002246078': [
    {
      min: 1, max: 20, contactEntryId: 'contacts-custom-1788005423451', // Кристина Герштаг
      relations: {
        '1-5': 'Они оказали вам огромную услугу, использовав своё влияние в округе',
        '6-10': 'Они относятся к вам почти как к приёмному ребёнку',
        '11-15': 'Они поручают вам странные дела, потому что знают: вы умеете хранить секреты',
        '16-20': 'Вы обращаетесь к ним с самого детства по вопросам, в которых они уже как никто умеют разбираться',
      },
    },
    {
      min: 21, max: 40, contactEntryId: 'contacts-custom-1788005452209', // Ида Фулстаг
      relations: {
        '21-25': 'Во время совместных охотничьих вылазок вы делитесь друг с другом тайными опасениями',
        '26-30': 'Однажды ты несколько дней укрывался у неё от зверолюдов',
        '31-35': 'Она делится с вами небольшим количеством мяса в обмен на небольшую помощь',
        '36-40': 'Она считает вас источником мудрости и нередко прислушивается к вашим советам',
      },
    },
    {
      min: 41, max: 60, contactEntryId: 'contacts-custom-1788005464302', // Ральф Аскен
      relations: {
        '41-45': 'Когда выпадает случай, вы вместе ходите на рыбалку',
        '46-50': 'Он научил вас практическим навыкам, которыми вы пользуетесь по сих пор',
        '51-55': 'В минуту кризиса он оказал вам физическую защиту, прикрыв собой',
        '56-60': 'В тяжёлую минуту он сумел обработать ваши раны подручными средствами и не дал вам погибнуть',
      },
    },
    {
      min: 61, max: 80, contactEntryId: 'contacts-custom-1788005475517', // Оска Морайбер
      relations: {
        '61-65': 'В прошлом у вас были взаимовыгодные дела',
        '66-70': 'Вы — его постоянный клиент, а потому нередко становитесь его проводником',
        '71-75': 'Вы доверяете ему отвезти вас в какое-нибудь тайное место',
        '76-80': 'Он помог вам перенести нечто необычное, и теперь вы перед ним в долгу',
      },
    },
    {
      min: 81, max: 100, contactEntryId: 'contacts-custom-1788005527420', // Бертольд Оррван
      relations: {
        '81-85': 'В прошлом вы сообщили ему сведения, которые спасли жизни людей',
        '86-90': 'Он считает вас смутьяном, но уважает ваш характер и боевой дух',
        '91-95': 'Вы вместе совершили нечто невероятное, но он не показывает никому об этом рассказывать',
        '96-100': 'Он обращается к вам за советом по правовым вопросам, в которых он уже как то затрудняется разбираться',
      },
    },
  ],
};

// Id таблицы контактов «Простолюдины» — если карьера позволяет бросок по ней, игрок
// может вместо этого бросить по таблице «Соль земли»
export const commonersContactTableId = 'contact-commoners';
export const saltOfTheEarthContactTableId = 'abilities-custom-1788002246078';

// Возвращает id доступных карьере таблиц контактов (обычно 2, могут повторяться),
// на основе ссылок в строке карьеры «Контакты» (ссылки проставлены на карточки-таблицы
// контактов в разделе «Способности», подгруппа «Контакты»).
export const getCareerContactTableIds = (career: CodexEntry | null | undefined): string[] => {
  const row = career?.stats?.find((s) => s.label === 'Контакты');
  if (!row?.links) return [];
  return row.links
    .filter((l) => !!l.entryId && contactRollTables[l.entryId])
    .map((l) => l.entryId as string);
};

// Бросок d100 по конкретной таблице контактов — возвращает id выпавшего представителя
export const getContactEntryIdByRoll = (tableId: string, roll: number): string | null => {
  const table = contactRollTables[tableId];
  if (!table) return null;
  const found = table.find((r) => roll >= r.min && roll <= r.max);
  return found?.contactEntryId ?? null;
};

// Возвращает текст связи с персонажем для конкретного броска d100 по таблице контактов —
// ищет под-диапазон (обычно 5 очков) внутри диапазона выпавшего представителя.
export const getContactRelationByRoll = (tableId: string, roll: number): string | null => {
  const table = contactRollTables[tableId];
  if (!table) return null;
  const range = table.find((r) => roll >= r.min && roll <= r.max);
  if (!range) return null;
  const key = Object.keys(range.relations).find((k) => {
    const [min, max] = k.split('-').map(Number);
    return roll >= min && roll <= max;
  });
  return key ? range.relations[key] : null;
};

// Возвращает список всех представителей таблицы контактов для ручного выбора: id
// представителя и «представительский» бросок (нижняя граница его диапазона) —
// его достаточно, чтобы дальше корректно определить и NPC, и текст связи.
export const getContactTableEntries = (tableId: string): { contactEntryId: string; roll: number }[] => {
  const table = contactRollTables[tableId];
  if (!table) return [];
  return table.map((r) => ({ contactEntryId: r.contactEntryId, roll: r.min }));
};

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