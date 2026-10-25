import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { MapMarker, MapMarkerCategory, MapCategory } from '@/data/mapMarkers';

interface MarkerFormProps {
  categories: MapCategory[];
  initial: Partial<MapMarker> & { x: number; y: number };
  saving: boolean;
  onSave: (m: Partial<MapMarker> & { x: number; y: number; title: string; category: MapMarkerCategory }) => void;
  onCancel: () => void;
}

const MarkerForm = ({ categories, initial, saving, onSave, onCancel }: MarkerFormProps) => {
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [category, setCategory] = useState<MapMarkerCategory>(initial.category ?? 'custom');
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? '');
  const [hideImage, setHideImage] = useState(initial.hideImage ?? false);
  const [imageSize, setImageSize] = useState(initial.imageSize ?? 36);

  const field =
    'w-full rounded border border-gold/30 bg-secondary/40 px-3 py-2 font-body text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none';

  return (
    <Dialog open onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="z-[2000] max-w-xl bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-widest text-gold">
            {initial.id ? 'Изменить метку' : 'Конструктор метки'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <input className={field} placeholder="Название (необязательно)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            className={field}
            rows={7}
            placeholder="Описание (необязательно). Enter — новый абзац"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <div>
            <input
              className={field}
              placeholder="Ссылка на картинку из файлов Ядра (необязательно)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl.trim() && (
              <>
                <img src={imageUrl.trim()} alt="" className="mt-2 max-h-32 max-w-full rounded border border-gold/40 object-contain" />
                <label className="mt-3 flex items-center gap-2 font-body text-sm text-parchment/90">
                  <input type="checkbox" checked={hideImage} onChange={(e) => setHideImage(e.target.checked)} className="h-4 w-4 accent-[#b8860b]" />
                  Не показывать картинку в описании
                </label>
                <label className="mt-3 block font-body text-xs text-parchment/70">
                  Размер на карте: {Math.round(imageSize)}
                  <input
                    type="range"
                    min={8}
                    max={1000}
                    value={imageSize}
                    onChange={(e) => setImageSize(Number(e.target.value))}
                    className="mt-1 w-full accent-[#b8860b]"
                  />
                </label>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onCancel}
              className="rounded border border-gold/30 px-4 py-2 font-display text-xs uppercase tracking-widest text-parchment/80 hover:bg-secondary"
            >
              Отмена
            </button>
            <button
              disabled={saving}
              onClick={() =>
                onSave({ ...initial, title: title.trim(), description: description.trim(), category, imageUrl: imageUrl.trim(), imageSize, hideImage })
              }
              className="flex items-center gap-2 rounded border border-gold bg-secondary px-4 py-2 font-display text-xs uppercase tracking-widest text-gold-bright hover:bg-secondary/70 disabled:opacity-50"
            >
              <Icon name={saving ? 'Loader' : 'Check'} size={14} className={saving ? 'animate-spin' : ''} />
              Сохранить
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkerForm;
