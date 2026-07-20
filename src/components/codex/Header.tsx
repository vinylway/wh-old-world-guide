import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { sectionGroups } from '@/data/codex';

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <Icon name="BookMarked" size={26} className="text-gold group-hover:text-gold-bright transition-colors" />
          <span className="font-display text-lg md:text-xl font-bold tracking-wide text-gradient-gold">
            Кодекс Мира Легенд
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {sectionGroups.map((g) => (
            <Link
              key={g.id}
              to={g.path}
              className="story-link flex items-center gap-1.5 font-display text-sm uppercase tracking-widest text-parchment/80 hover:text-gold transition-colors"
            >
              <Icon name={g.icon} size={16} />
              {g.title}
            </Link>
          ))}
          <Link
            to="/#section-contacts"
            className="story-link font-display text-sm uppercase tracking-widest text-parchment/80 hover:text-gold transition-colors"
          >
            Контакты
          </Link>
          <Link
            to="/generator"
            className="story-link flex items-center gap-1.5 font-display text-sm uppercase tracking-widest text-gold hover:text-gold-bright transition-colors"
          >
            <Icon name="Dices" size={16} />
            Генератор
          </Link>
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
            {sectionGroups.map((g) => (
              <Link
                key={g.id}
                to={g.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-left font-display text-sm uppercase tracking-wide text-parchment/80 hover:bg-secondary hover:text-gold transition-colors"
              >
                <Icon name={g.icon} size={16} fallback="Circle" />
                {g.title}
              </Link>
            ))}
            <Link
              to="/#section-contacts"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded px-3 py-2 text-left font-display text-sm uppercase tracking-wide text-parchment/80 hover:bg-secondary hover:text-gold transition-colors"
            >
              <Icon name="Feather" size={16} />
              Контакты
            </Link>
            <Link
              to="/generator"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded px-3 py-2 text-left font-display text-sm uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
            >
              <Icon name="Dices" size={16} />
              Генератор
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;