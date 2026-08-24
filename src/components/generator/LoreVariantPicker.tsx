import { loreVariantOptions } from '@/data/generator';

interface LoreVariantPickerProps {
  loreId: string;
  value?: string;
  onChange: (variant: string) => void;
  excludeVariants?: string[];
}

const LoreVariantPicker = ({ loreId, value, onChange, excludeVariants = [] }: LoreVariantPickerProps) => {
  const allPresets = loreVariantOptions[loreId] ?? [];
  const presets = allPresets.filter((v) => v === value || !excludeVariants.includes(v));
  const isCustom = !!value && !allPresets.includes(value);

  return (
    <div className="mt-2 pl-3 border-l-2 border-gold/30">
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {presets.map((variant) => (
            <button
              key={variant}
              onClick={() => onChange(variant)}
              className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                value === variant
                  ? 'border-gold bg-secondary text-gold-bright'
                  : 'border-gold/30 text-parchment/80 hover:bg-secondary'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        value={isCustom ? value ?? '' : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Свой вариант…"
        className="w-full max-w-xs rounded border border-gold/30 bg-secondary/20 px-3 py-1.5 font-body text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
      />
    </div>
  );
};

export default LoreVariantPicker;
