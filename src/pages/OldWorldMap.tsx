import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/codex/Header';
import Icon from '@/components/ui/icon';
import MarkerForm from '@/components/map/MarkerForm';
import { CodexOverridesProvider, useCodexOverrides } from '@/hooks/useCodexOverrides';
import {
  mapMarkers,
  defaultCategories,
  MapCategory,
  MapMarker,
  MapMarkerCategory,
  MAP_SIZE,
} from '@/data/mapMarkers';

const IMG_W = 4341;
const IMG_H = 6368;
const MAX_NATIVE_ZOOM = 4;
const REF_ZOOM = 2;
const MARKERS_API = 'https://functions.poehali.dev/2b206eaf-1c19-429c-a96b-d9523e081560';
const TILES_URL = '/map-tiles/{z}/{x}/{y}.webp';

type FormState = Partial<MapMarker> & { x: number; y: number };

const OldWorldMapContent = () => {
  const { isEditMode, password, unlock, lock, isUnlocking, loginError } = useCodexOverrides();
  const [customMarkers, setCustomMarkers] = useState<MapMarker[]>([]);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<MapCategory[]>(defaultCategories);
  const [hidden, setHidden] = useState<string[]>([]);
  const [inactive, setInactive] = useState<Set<MapMarkerCategory>>(new Set());
  const [catEditorOpen, setCatEditorOpen] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatColor, setNewCatColor] = useState('#b8860b');
  const active = useMemo(
    () => ({ has: (c: string) => !inactive.has(c) }),
    [inactive]
  );
  const catById = (id: string) => categories.find((c) => c.id === id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const toLatLng = (m: { x: number; y: number }) =>
    L.CRS.Simple.pointToLatLng(
      L.point((m.x / MAP_SIZE.width) * IMG_W, (m.y / MAP_SIZE.height) * IMG_H),
      MAX_NATIVE_ZOOM
    );

  const allMarkers = useMemo(
    () => [...mapMarkers.filter((m) => !hidden.includes(m.id)), ...customMarkers],
    [customMarkers, hidden]
  );

  const loadMarkers = async () => {
    try {
      const res = await fetch(MARKERS_API);
      const data = await res.json();
      if (data.categories?.length) setCategories(data.categories);
      setHidden(data.hidden || []);
      setCustomMarkers(
        (data.markers || []).map((m: MapMarker) => ({
          ...m,
          title: m.title === 'Новая метка' ? '' : m.title,
          custom: true,
        }))
      );
    } catch {
      setCustomMarkers([]);
    }
  };

  useEffect(() => {
    loadMarkers();
  }, []);

  useEffect(() => {
    addingRef.current = adding;
    if (containerRef.current) containerRef.current.style.cursor = adding ? 'crosshair' : '';
  }, [adding]);

  const saveMarker = async (m: Partial<MapMarker>) => {
    if (!password) return;
    setSaving(true);
    try {
      const res = await fetch(MARKERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
        body: JSON.stringify({ action: 'save', ...m }),
      });
      if (res.status === 401) {
        lock();
        return;
      }
      await loadMarkers();
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  const moveMarker = async (m: MapMarker, x: number, y: number) => {
    if (!password) return;
    setCustomMarkers((prev) => prev.map((c) => (c.id === m.id ? { ...c, x, y } : c)));
    const res = await fetch(MARKERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
      body: JSON.stringify({ action: 'save', ...m, x, y }),
    });
    if (res.status === 401) lock();
    await loadMarkers();
  };

  const resizeMarker = async (m: MapMarker, imageSize: number) => {
    if (!password) return;
    setCustomMarkers((prev) => prev.map((c) => (c.id === m.id ? { ...c, imageSize } : c)));
    const res = await fetch(MARKERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
      body: JSON.stringify({ action: 'save', ...m, imageSize }),
    });
    if (res.status === 401) lock();
    await loadMarkers();
  };

  const deleteMarker = async (m: MapMarker) => {
    if (!window.confirm('Удалить метку?')) return;
    setSelectedId(null);
    await post(m.custom ? { action: 'delete', id: m.id } : { action: 'hide', id: m.id });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMarkers.filter(
      (m) => active.has(m.category) && (!q || (m.title || '').toLowerCase().includes(q))
    );
  }, [query, active, allMarkers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const sw = L.CRS.Simple.pointToLatLng(L.point(0, IMG_H), MAX_NATIVE_ZOOM);
    const ne = L.CRS.Simple.pointToLatLng(L.point(IMG_W, 0), MAX_NATIVE_ZOOM);
    const bounds = L.latLngBounds(sw, ne);

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: MAX_NATIVE_ZOOM + 2,
      maxBounds: bounds.pad(0.2),
      maxBoundsViscosity: 0.8,
      zoomSnap: 0.25,
      attributionControl: false,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(TILES_URL, {
      tileSize: 256,
      minNativeZoom: 0,
      maxNativeZoom: MAX_NATIVE_ZOOM,
      maxZoom: MAX_NATIVE_ZOOM + 2,
      bounds,
      noWrap: true,
    }).addTo(map);
    map.fitBounds(bounds);
    const updateScale = () =>
      map.getContainer().style.setProperty('--ow-scale', String(Math.pow(2, map.getZoom() - REF_ZOOM)));
    updateScale();
    map.on('zoom zoomend', updateScale);
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!addingRef.current) return;
      const p = L.CRS.Simple.latLngToPoint(e.latlng, MAX_NATIVE_ZOOM);
      setForm({
        x: (p.x / IMG_W) * MAP_SIZE.width,
        y: (p.y / IMG_H) * MAP_SIZE.height,
      });
      setAdding(false);
    });
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markerRefs.current = {};
    visible.forEach((m) => {
      const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
      const hs = m.imageSize ?? 36;
      const dot = m.imageUrl
        ? `<img class="ow-marker__img" style="--s:${hs}" src="${esc(m.imageUrl)}" alt="" />`
        : `<div class="ow-marker__dot" style="background:${esc(catById(m.category)?.color ?? '#5b3a8b')}"></div>`;
      const canResize = isEditMode && !!m.custom && !!m.imageUrl;
      const handle = canResize ? `<div class="ow-marker__handle" style="--s:${hs}"></div>` : '';
      const label = m.title && !m.imageUrl ? `<div class="ow-marker__label">${esc(m.title)}</div>` : '';
      const icon = L.divIcon({
        className: 'ow-marker',
        html: `${dot}${handle}${label}`,
        iconSize: [0, 0],
      });
      const marker = L.marker(toLatLng(m), { icon, draggable: isEditMode && !!m.custom }).addTo(layer);
      if (isEditMode && m.custom) {
        marker.on('dragend', () => {
          const p = L.CRS.Simple.latLngToPoint(marker.getLatLng(), MAX_NATIVE_ZOOM);
          moveMarker(m, (p.x / IMG_W) * MAP_SIZE.width, (p.y / IMG_H) * MAP_SIZE.height);
        });
      }
      marker.on('click', () => setSelectedId(m.id));
      const root = marker.getElement();
      const handleEl = root?.querySelector<HTMLElement>('.ow-marker__handle');
      const imgEl = root?.querySelector<HTMLElement>('.ow-marker__img');
      const labelEl = root?.querySelector<HTMLElement>('.ow-marker__label');
      if (handleEl && imgEl) {
        ['mousedown', 'touchstart', 'click', 'dblclick'].forEach((ev) =>
          handleEl.addEventListener(ev, (e) => e.stopPropagation())
        );
        handleEl.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          handleEl.setPointerCapture(e.pointerId);
          const rect = imgEl.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          let size = m.imageSize ?? 36;
          const apply = (v: number) => {
            [imgEl, handleEl, labelEl].forEach((el) => el?.style.setProperty('--s', String(v)));
          };
          const onMove = (ev: PointerEvent) => {
            const scale = Math.pow(2, (mapRef.current?.getZoom() ?? REF_ZOOM) - REF_ZOOM);
            const px = 2 * Math.max(ev.clientX - cx, ev.clientY - cy);
            size = Math.min(20000, Math.max(4, Math.round((px / scale) * 10) / 10));
            apply(size);
          };
          const onUp = () => {
            handleEl.removeEventListener('pointermove', onMove);
            handleEl.removeEventListener('pointerup', onUp);
            handleEl.removeEventListener('pointercancel', onUp);
            resizeMarker(m, size);
          };
          handleEl.addEventListener('pointermove', onMove);
          handleEl.addEventListener('pointerup', onUp);
          handleEl.addEventListener('pointercancel', onUp);
        });
      }
      markerRefs.current[m.id] = marker;
    });
  }, [visible, isEditMode, password, categories]);

  const focusMarker = (m: MapMarker) => {
    setSelectedId(m.id);
    mapRef.current?.flyTo(toLatLng(m), 2.5, { duration: 0.8 });
  };

  const toggleCategory = (c: MapMarkerCategory) => {
    setInactive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const post = async (payload: Record<string, unknown>) => {
    if (!password) return false;
    const res = await fetch(MARKERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      lock();
      return false;
    }
    await loadMarkers();
    return res.ok;
  };

  const addCategory = async () => {
    if (!newCatTitle.trim()) return;
    if (await post({ action: 'save_category', title: newCatTitle.trim(), color: newCatColor })) setNewCatTitle('');
  };

  const renameCategory = (c: MapCategory) => {
    const title = window.prompt('Новое название категории', c.title);
    if (title && title.trim()) post({ action: 'save_category', id: c.id, title: title.trim(), color: c.color });
  };

  const removeCategory = (c: MapCategory) => {
    if (window.confirm(`Удалить категорию «${c.title}»? Её метки перейдут в «Мои метки».`))
      post({ action: 'delete_category', id: c.id });
  };

  const selected = allMarkers.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="relative isolate flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0 bg-[#d9c9a0]" />

        <div className="absolute left-3 top-3 z-[1000] w-[calc(100%-1.5rem)] sm:w-96">
          <div className="parchment-panel rounded border border-gold/40 bg-background/95 shadow-lg">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="flex w-full items-center justify-between px-4 py-3 font-display text-sm uppercase tracking-widest text-gold"
            >
              <span className="flex items-center gap-2">
                <Icon name="Map" size={16} /> Карта Старого Света
              </span>
              <Icon name={panelOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>

            {panelOpen && (
              <div className="border-t border-gold/20 p-3 space-y-3">
                <div className="relative">
                  <Icon name="Search" size={14} className="absolute left-2.5 top-2.5 text-gold/70" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск места"
                    className="w-full rounded border border-gold/30 bg-secondary/40 py-1.5 pl-8 pr-2 font-body text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                        active.has(cat.id)
                          ? 'border-gold bg-secondary text-gold-bright'
                          : 'border-gold/20 text-parchment/50'
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                      {cat.title}
                    </button>
                  ))}
                </div>

                {isEditMode && (
                  <div>
                    <button
                      onClick={() => setCatEditorOpen(!catEditorOpen)}
                      className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-gold/80 hover:text-gold"
                    >
                      <Icon name="Tags" size={12} /> Категории
                    </button>
                    {catEditorOpen && (
                      <div className="mt-2 space-y-1.5 rounded border border-gold/20 p-2">
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center gap-2">
                            <input
                              type="color"
                              value={cat.color}
                              onChange={(e) => post({ action: 'save_category', id: cat.id, title: cat.title, color: e.target.value })}
                              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                            <span className="flex-1 truncate font-body text-sm text-parchment/90">{cat.title}</span>
                            <button onClick={() => renameCategory(cat)} className="text-parchment/60 hover:text-gold" aria-label="Переименовать">
                              <Icon name="Pencil" size={13} />
                            </button>
                            {cat.id !== 'custom' && (
                              <button onClick={() => removeCategory(cat)} className="text-red-300/80 hover:text-red-300" aria-label="Удалить">
                                <Icon name="Trash2" size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="color"
                            value={newCatColor}
                            onChange={(e) => setNewCatColor(e.target.value)}
                            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <input
                            value={newCatTitle}
                            onChange={(e) => setNewCatTitle(e.target.value)}
                            placeholder="Новая категория"
                            className="min-w-0 flex-1 rounded border border-gold/30 bg-secondary/40 px-2 py-1 font-body text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
                          />
                          <button onClick={addCategory} className="rounded border border-gold px-2 py-1 text-gold-bright hover:bg-secondary" aria-label="Добавить">
                            <Icon name="Plus" size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isEditMode ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAdding(!adding)}
                      className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wide ${
                        adding ? 'border-gold bg-secondary text-gold-bright' : 'border-gold/40 text-parchment hover:bg-secondary'
                      }`}
                    >
                      <Icon name="MapPin" size={13} />
                      {adding ? 'Кликните по карте' : 'Добавить метку'}
                    </button>
                    <button onClick={lock} className="rounded border border-gold/20 px-3 py-1.5 font-display text-xs uppercase tracking-wide text-parchment/60 hover:bg-secondary">
                      Выйти
                    </button>
                  </div>
                ) : showPw ? (
                  <form
                    className="flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (await unlock(pwInput)) {
                        setPwInput('');
                        setShowPw(false);
                      }
                    }}
                  >
                    <input
                      type="password"
                      value={pwInput}
                      onChange={(e) => setPwInput(e.target.value)}
                      placeholder="Пароль редактора"
                      className="min-w-0 flex-1 rounded border border-gold/30 bg-secondary/40 px-2 py-1.5 font-body text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
                    />
                    <button disabled={isUnlocking} className="rounded border border-gold px-3 font-display text-xs uppercase text-gold-bright hover:bg-secondary">
                      Ок
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setShowPw(true)} className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide text-gold/80 hover:text-gold">
                    <Icon name="Pencil" size={12} /> Редактировать карту
                  </button>
                )}
                {loginError && showPw && <p className="font-body text-xs text-red-400">{loginError}</p>}

                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {visible.length === 0 && (
                    <li className="font-body text-sm text-parchment/60">Ничего не найдено</li>
                  )}
                  {visible.map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => focusMarker(m)}
                        className={`w-full rounded px-2 py-1 text-left font-body text-sm transition-colors hover:bg-secondary ${
                          selectedId === m.id ? 'bg-secondary text-gold-bright' : 'text-parchment/85'
                        }`}
                      >
                        {m.title || 'Без названия'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="absolute left-3 top-24 z-[1000] max-h-[calc(100%-7rem)] w-[calc(100%-1.5rem)] overflow-y-auto rounded border border-gold/50 bg-background/95 p-5 shadow-xl animate-fade-in sm:w-[28rem]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm uppercase tracking-widest text-gold/70">
                  {catById(selected.category)?.title ?? 'Без категории'}
                </p>
                {selected.title && (
                  <h3 className="font-display text-3xl font-bold text-gold-bright">{selected.title}</h3>
                )}
              </div>
              <button onClick={() => setSelectedId(null)} className="text-parchment/60 hover:text-gold" aria-label="Закрыть">
                <Icon name="X" size={22} />
              </button>
            </div>
            {selected.imageUrl && !selected.hideImage && (
              <img src={selected.imageUrl} alt={selected.title} className="mt-4 max-h-64 max-w-full mx-auto object-contain" />
            )}
            {selected.description && (
              <div className="mt-3 space-y-3 font-body text-lg leading-relaxed text-parchment/90">
                {selected.description
                  .split(/\n+/)
                  .filter((t) => t.trim())
                  .map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
              </div>
            )}
            {isEditMode && selected.custom && (
              <p className="mt-3 font-body text-sm text-gold/70">Перетащите метку, чтобы переместить; потяните за угол картинки, чтобы изменить размер.</p>
            )}
            {isEditMode && (
              <div className="mt-3 flex gap-2">
                {selected.custom && (
                <button onClick={() => setForm(selected)} className="flex items-center gap-1.5 rounded border border-gold/40 px-3 py-1.5 font-display text-sm uppercase tracking-wide text-parchment hover:bg-secondary">
                  <Icon name="Pencil" size={12} /> Изменить
                </button>
                )}
                <button onClick={() => deleteMarker(selected)} className="flex items-center gap-1.5 rounded border border-red-400/40 px-3 py-1.5 font-display text-sm uppercase tracking-wide text-red-300 hover:bg-secondary">
                  <Icon name="Trash2" size={12} /> Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {form && (
        <MarkerForm categories={categories} initial={form} saving={saving} onSave={saveMarker} onCancel={() => setForm(null)} />
      )}
    </div>
  );
};

const OldWorldMap = () => (
  <CodexOverridesProvider>
    <OldWorldMapContent />
  </CodexOverridesProvider>
);

export default OldWorldMap;
