export interface StatRow {
  label: string;
  base: number;
  boosted: boolean;
  final: number;
}

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
}

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

export const bretonNames: string[] = [
  'Жиль', 'Жак', 'Перрен', 'Марсель', 'Рауль', 'Этьен', 'Анри', 'Бертран', 'Одо', 'Томен',
  'Моник', 'Изабо', 'Томасс', 'Перрет', 'Жизель', 'Женевьев', 'Марго', 'Симона', 'Жюльот', 'Беатрис',
];

export const getRandomBretonName = (): string =>
  bretonNames[Math.floor(Math.random() * bretonNames.length)];

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