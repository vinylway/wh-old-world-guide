import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { sectionGroups } from '@/data/codex';

const Footer = () => {
  return (
    <footer className="border-t border-gold/25 bg-background">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="BookMarked" size={24} className="text-gold" />
              <span className="font-display text-lg font-bold text-gradient-gold">Кодекс Мира Легенд</span>
            </div>
            <p className="font-body text-base text-muted-foreground">
              Неофициальный справочник по настольной ролевой игре Warhammer: The Old World.
              Создан фанатами для летописцев и героев.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2">
            {sectionGroups.map((g) => (
              <Link
                key={g.id}
                to={g.path}
                className="story-link text-left font-display text-sm uppercase tracking-wide text-parchment/70 hover:text-gold transition-colors"
              >
                {g.title}
              </Link>
            ))}
            <Link
              to="/#section-contacts"
              className="story-link text-left font-display text-sm uppercase tracking-wide text-parchment/70 hover:text-gold transition-colors"
            >
              Контакты
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gold/15 pt-6">
          <p className="font-body text-sm text-muted-foreground">© {new Date().getFullYear()} Кодекс Мира Легенд</p>
          <p className="font-rune text-sm text-gold/60 tracking-wide">Taal protects</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;