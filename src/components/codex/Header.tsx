import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { sections } from '@/data/codex';

const Header = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <button
          onClick={() => scrollTo('top')}
          className="flex items-center gap-3 group"
        >
          <Icon name="BookMarked" size={26} className="text-gold group-hover:text-gold-bright transition-colors" />
          <span className="font-display text-lg md:text-xl font-bold tracking-wide text-gradient-gold">
            Кодекс Старого Света
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(`section-${s.id}`)}
              className="story-link font-display text-sm uppercase tracking-widest text-parchment/80 hover:text-gold transition-colors"
            >
              {s.title}
            </button>
          ))}
        </nav>

        <button
          className="lg:hidden text-gold"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          <Icon name={open ? 'X' : 'Menu'} size={26} />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-gold/20 bg-background/95 animate-fade-in">
          <div className="container grid grid-cols-2 gap-2 py-4">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(`section-${s.id}`)}
                className="flex items-center gap-2 rounded px-3 py-2 text-left font-display text-sm uppercase tracking-wide text-parchment/80 hover:bg-secondary hover:text-gold transition-colors"
              >
                <Icon name={s.icon} size={16} fallback="Circle" />
                {s.title}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
