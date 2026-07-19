export type SourceId = 'gm' | 'player';

export interface Source {
  id: SourceId;
  title: string;
  icon: string;
}

export const sources: Source[] = [
  { id: 'gm', title: 'Руководство ведущего', icon: 'Crown' },
  { id: 'player', title: 'Руководство игрока', icon: 'UserRound' },
];

export interface CodexEntry {
  id: string;
  title: string;
  section: SectionId;
  source: SourceId;
  summary: string;
  tags: string[];
  meta?: string;
  category?: ItemCategoryId;
  stats?: { label: string; value: string }[];
}

export type ItemCategoryId = 'melee' | 'throwing' | 'ranged' | 'armor';

export interface ItemCategory {
  id: ItemCategoryId;
  title: string;
  icon: string;
}

export const itemCategories: ItemCategory[] = [
  { id: 'melee', title: 'Ближний бой', icon: 'Sword' },
  { id: 'throwing', title: 'Метательное оружие', icon: 'Target' },
  { id: 'ranged', title: 'Дальний бой', icon: 'Crosshair' },
  { id: 'armor', title: 'Доспехи', icon: 'ShieldHalf' },
];

export type SectionId = 'rules' | 'creatures' | 'items' | 'magic' | 'contacts';

export interface Section {
  id: SectionId;
  title: string;
  icon: string;
  description: string;
}

export const sections: Section[] = [
  { id: 'rules', title: 'Правила', icon: 'ScrollText', description: 'Механики, характеристики, броски и боевая система' },
  { id: 'creatures', title: 'Существа', icon: 'Skull', description: 'Бестиарий Старого Света: от гоблинов до драконов' },
  { id: 'items', title: 'Предметы', icon: 'Sword', description: 'Оружие, доспехи, артефакты и снаряжение' },
  { id: 'magic', title: 'Магия', icon: 'Sparkles', description: 'Ветра магии, заклинания и колдовские традиции' },
  { id: 'contacts', title: 'Контакты', icon: 'Feather', description: 'Гильдия мастеров и связь с летописцами' },
];

export const entries: CodexEntry[] = [
  {
    id: 'r1', section: 'rules', source: 'player', title: 'Проверки характеристик',
    summary: 'Базовый бросок d100: если результат равен или ниже значения навыка — успех. Модификаторы применяются к целевому числу.',
    tags: ['d100', 'проверка', 'навыки', 'бросок'], meta: 'Глава I',
  },
  {
    id: 'r2', section: 'rules', source: 'player', title: 'Инициатива и порядок ходов',
    summary: 'В начале раунда участники бросают d10 + Ловкость. Действует правило от большего к меньшему; при ничьей ходит персонаж с большей Ловкостью.',
    tags: ['инициатива', 'бой', 'раунд', 'ловкость'], meta: 'Глава IV',
  },
  {
    id: 'r3', section: 'rules', source: 'gm', title: 'Критические ранения',
    summary: 'При двойном совпадении цифр (11, 22, 33…) в успешной атаке наносится критический эффект по таблице ранений соответствующей части тела.',
    tags: ['крит', 'ранение', 'урон', 'таблица'], meta: 'Глава V',
  },
  {
    id: 'r4', section: 'rules', source: 'player', title: 'Очки судьбы',
    summary: 'Позволяют перебросить неудачный бросок или избежать верной гибели. Восстанавливаются в начале сессии по решению Мастера Игры.',
    tags: ['судьба', 'переброс', 'удача'], meta: 'Глава II',
  },
  {
    id: 'c1', section: 'creatures', source: 'gm', title: 'Гоблин Ночных Гоблинов',
    summary: 'Трусливый, но многочисленный обитатель пещер. Боится света, использует ядовитые грибы и фанатиков с шарами на цепях.',
    tags: ['гоблин', 'орки', 'пещеры', 'яд'], meta: 'Угроза: низкая',
  },
  {
    id: 'c2', section: 'creatures', source: 'gm', title: 'Имперский Грифон',
    summary: 'Гордый хищник Серых гор, символ Рейкланда. Приручается рыцарями, обладает мощной атакой когтями и клювом.',
    tags: ['грифон', 'империя', 'горы', 'ездовое'], meta: 'Угроза: высокая',
  },
  {
    id: 'c3', section: 'creatures', source: 'gm', title: 'Вампир из рода фон Карштайн',
    summary: 'Аристократ нежити, повелевающий ветром Шиш. Регенерирует раны, гипнотизирует жертв и поднимает армии скелетов.',
    tags: ['вампир', 'нежить', 'карштайн', 'магия смерти'], meta: 'Угроза: смертельная',
  },
  {
    id: 'c4', section: 'creatures', source: 'gm', title: 'Древень Атель Лорена',
    summary: 'Древний живой лес-хранитель. Медлителен, но невероятно вынослив; сокрушает врагов ветвями и топит корнями.',
    tags: ['древень', 'лесные эльфы', 'атель лорен', 'дерево'], meta: 'Угроза: высокая',
  },
  {
    id: 'i1', section: 'items', source: 'player', title: 'Рунический молот гномов', category: 'melee',
    summary: 'Выкованное в кузнях Караз-а-Карака оружие с рунами Мастера. Игнорирует часть доспеха и наносит бонусный урон демонам.',
    tags: ['молот', 'руны', 'гномы', 'оружие'], meta: 'Артефакт',
  },
  {
    id: 'i2', section: 'items', source: 'player', title: 'Ithilmar-доспех', category: 'armor',
    summary: 'Лёгкий эльфийский сплав, дающий защиту тяжёлой брони при весе кожаной. Ценится дороже золота.',
    tags: ['доспех', 'итильмар', 'эльфы', 'защита'], meta: 'Редкий',
  },
  {
    id: 'i3', section: 'items', source: 'player', title: 'Хохландская длинная винтовка', category: 'ranged',
    summary: 'Дальнобойное огнестрельное оружие Империи. Требует раунд на перезарядку, но пробивает любой доспех на дистанции.',
    tags: ['винтовка', 'порох', 'империя', 'дальний бой'], meta: 'Снаряжение',
  },
  {
    id: 'i4', section: 'items', source: 'player', title: 'Метательное копьё', category: 'throwing',
    summary: 'Метательное копьё: оружие, также известное как дротик. Оно часто применяется всадниками норскийских мародёров и другими отрядами конных застрельщиков для поддержки во время стремительного сближения с противником перед переходом в ближний бой.',
    tags: ['копьё', 'дротик', 'мародёры', 'метательное'], meta: 'Снаряжение',
    stats: [
      { label: 'Название', value: 'Метательное копьё' },
      { label: 'Мин. цена', value: 'Медь' },
      { label: 'Оптимальная дистанция', value: 'Ближняя-средняя' },
      { label: 'Урон', value: 'С' },
      { label: '1Р/2Р', value: '1Р' },
      { label: 'Черты', value: '—' },
    ],
  },
  {
    id: 'i5', section: 'items', source: 'player', title: 'Камень', category: 'throwing',
    summary: 'Камень: хотя камни и подобные предметы не являются боевым оружием, при должном усилии они способны нанести серьёзные травмы или оставить тяжёлые ушибы.',
    tags: ['камень', 'подручное', 'метательное'], meta: 'Подручное',
    stats: [
      { label: 'Название', value: 'Камень' },
      { label: 'Мин. цена', value: '—' },
      { label: 'Оптимальная дистанция', value: 'Короткая-средняя' },
      { label: 'Урон', value: '—' },
      { label: '1Р/2Р', value: '—' },
      { label: 'Черты', value: 'Не может нанести РАНУ (за исключением случаев, когда противник уже находится в СОСТОЯНИИ ошеломления)' },
    ],
  },
  {
    id: 'm1', section: 'magic', source: 'player', title: 'Ветер Азир (Небеса)',
    summary: 'Голубой ветер магии предвидения и молний. Даёт заклинания призыва бури и прорицания судьбы противника.',
    tags: ['азир', 'небеса', 'ветер', 'молния'], meta: 'Ветер магии',
  },
  {
    id: 'm2', section: 'magic', source: 'player', title: 'Клятвенный огонь Аквши',
    summary: 'Заклинание Багрового ветра: столб пламени, поглощающий врагов и усиливающийся против трусливых противников.',
    tags: ['аквши', 'огонь', 'пламя', 'заклинание'], meta: 'Заклинание',
  },
  {
    id: 'm3', section: 'magic', source: 'gm', title: 'Ветер Шиш (Смерть)',
    summary: 'Фиолетовый ветер увядания. Некроманты вытягивают жизнь из живых и поднимают павших воинов.',
    tags: ['шиш', 'смерть', 'некромантия', 'нежить'], meta: 'Ветер магии',
  },
];
