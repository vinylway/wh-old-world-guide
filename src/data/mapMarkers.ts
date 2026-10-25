export type MapMarkerCategory = 'realm' | 'wild' | 'sea' | 'custom';

export interface MapMarker {
  id: string;
  title: string;
  category: MapMarkerCategory;
  description: string;
  x: number;
  y: number;
  imageUrl?: string;
  imageSize?: number;
  custom?: boolean;
}

export const MAP_SIZE = { width: 900, height: 1320 };

export const mapCategories: Record<MapMarkerCategory, { title: string; icon: string }> = {
  realm: { title: 'Государства', icon: 'Crown' },
  wild: { title: 'Дикие земли', icon: 'Mountain' },
  sea: { title: 'Моря и океаны', icon: 'Waves' },
  custom: { title: 'Мои метки', icon: 'MapPin' },
};

export const mapMarkers: MapMarker[] = [
  { id: 'empire', title: 'Империя', category: 'realm', description: 'Крупнейшее человеческое государство Старого Света, управляемое императором из Альтдорфа.', x: 330, y: 500 },
  { id: 'bretonnia', title: 'Бретония', category: 'realm', description: 'Рыцарское королевство на западе, живущее по кодексу чести и под покровительством Владычицы Озера.', x: 140, y: 560 },
  { id: 'kislev', title: 'Кислев', category: 'realm', description: 'Северное царство конных воинов, щит Старого Света от Хаоса.', x: 540, y: 330 },
  { id: 'norsca', title: 'Норска', category: 'wild', description: 'Суровые северные земли, населённые племенами, поклоняющимися тёмным богам.', x: 150, y: 340 },
  { id: 'chaos-wastes', title: 'Пустоши Хаоса', category: 'wild', description: 'Искажённые земли на крайнем севере — обитель демонов и воинов Хаоса.', x: 450, y: 140 },
  { id: 'darklands', title: 'Тёмные земли', category: 'wild', description: 'Выжженная равнина к востоку от Гор Края Мира, дом зеленокожих и мрачных крепостей.', x: 640, y: 610 },
  { id: 'land-of-dead', title: 'Земля мёртвых', category: 'realm', description: 'Древнее королевство Кхемри, где под песками покоятся неупокоенные владыки.', x: 400, y: 1000 },
  { id: 'arabia', title: 'Арабия', category: 'realm', description: 'Пустынные земли на юго-западе, родина караванов и султанов.', x: 130, y: 1060 },
  { id: 'lustria', title: 'Южные земли', category: 'wild', description: 'Жаркие джунгли далёкого юга, куда немногие возвращаются.', x: 350, y: 1230 },
  { id: 'great-ocean', title: 'Великий океан', category: 'sea', description: 'Бескрайние воды к западу от Старого Света.', x: 150, y: 830 },
  { id: 'sea-of-dread', title: 'Море Ужаса', category: 'sea', description: 'Опасные воды восточнее Старого Света, где ходят корсары.', x: 800, y: 880 },
];
