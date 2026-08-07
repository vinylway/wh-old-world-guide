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
  careerId?: string;
  careerTitle?: string;
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