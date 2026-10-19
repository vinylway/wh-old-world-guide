import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/codex/Header';
import Icon from '@/components/ui/icon';
import {
  mapMarkers,
  mapCategories,
  MapMarker,
  MapMarkerCategory,
  MAP_SIZE,
} from '@/data/mapMarkers';

const IMG_W = 4341;
const IMG_H = 6368;
const MAX_NATIVE_ZOOM = 4;
const TILES_URL = '/map-tiles/{z}/{x}/{y}.webp';

const OldWorldMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Set<MapMarkerCategory>>(
    new Set(Object.keys(mapCategories) as MapMarkerCategory[])
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const toLatLng = (m: { x: number; y: number }) =>
    L.CRS.Simple.pointToLatLng(
      L.point((m.x / MAP_SIZE.width) * IMG_W, (m.y / MAP_SIZE.height) * IMG_H),
      MAX_NATIVE_ZOOM
    );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapMarkers.filter(
      (m) => active.has(m.category) && (!q || m.title.toLowerCase().includes(q))
    );
  }, [query, active]);

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
      const icon = L.divIcon({
        className: 'ow-marker',
        html: `<div class="ow-marker__dot ow-marker__dot--${m.category}"></div><div class="ow-marker__label">${m.title}</div>`,
        iconSize: [0, 0],
      });
      const marker = L.marker(toLatLng(m), { icon }).addTo(layer);
      marker.on('click', () => setSelectedId(m.id));
      markerRefs.current[m.id] = marker;
    });
  }, [visible]);

  const focusMarker = (m: MapMarker) => {
    setSelectedId(m.id);
    mapRef.current?.flyTo(toLatLng(m), 2.5, { duration: 0.8 });
  };

  const toggleCategory = (c: MapMarkerCategory) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const selected = mapMarkers.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0 bg-[#d9c9a0]" />

        <div className="absolute left-3 top-3 z-[1000] w-[calc(100%-1.5rem)] sm:w-80">
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
                  {(Object.keys(mapCategories) as MapMarkerCategory[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                        active.has(c)
                          ? 'border-gold bg-secondary text-gold-bright'
                          : 'border-gold/20 text-parchment/50'
                      }`}
                    >
                      <Icon name={mapCategories[c].icon} size={12} fallback="Circle" />
                      {mapCategories[c].title}
                    </button>
                  ))}
                </div>

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
                        {m.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="absolute bottom-4 left-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded border border-gold/50 bg-background/95 p-4 shadow-xl animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xs uppercase tracking-widest text-gold/70">
                  {mapCategories[selected.category].title}
                </p>
                <h3 className="font-display text-xl font-bold text-gold-bright">{selected.title}</h3>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-parchment/60 hover:text-gold" aria-label="Закрыть">
                <Icon name="X" size={18} />
              </button>
            </div>
            <p className="mt-2 font-body text-sm leading-snug text-parchment/90">{selected.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OldWorldMap;
