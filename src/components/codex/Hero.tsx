import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { sectionGroups } from '@/data/codex';
import OrnateDivider from './OrnateDivider';

interface HeroProps {
  onSearchClick: () => void;
}

const Hero = ({ onSearchClick }: HeroProps) => {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container relative py-24 md:py-36 text-center animate-fade-in">
        <p className="font-rune text-gold/80 tracking-[0.3em] uppercase text-sm mb-6 animate-flicker">
          Warhammer · The Old World · RPG
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-gradient-gold drop-shadow-[0_2px_20px_rgba(200,153,47,0.25)]">
          Кодекс<br className="md:hidden" /> Мира Легенд
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg md:text-2xl text-parchment/85 leading-relaxed">
          Полный справочник для летописцев и искателей приключений: правила, бестиарий,
          артефакты, ветра магии, земли и великие силы Старого Света.
        </p>

        <OrnateDivider className="my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSearchClick}
            className="group flex items-center gap-3 rounded border border-gold/40 bg-gold px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-gold hover-scale"
          >
            <Icon name="Search" size={18} />
            Искать в кодексе
          </button>
          <Link
            to="/generator"
            className="flex items-center gap-3 rounded border border-gold/40 px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
          >
            <Icon name="Dices" size={18} />
            Создать персонажа
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          {sectionGroups.map((g) => (
            <Link
              key={g.id}
              to={g.path}
              className="group flex items-center gap-3 rounded border border-gold/40 px-6 py-4 font-display text-sm uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name={g.icon} size={20} className="text-gold" />
              <span className="text-left">
                <span className="block text-base font-semibold group-hover:text-gold-bright transition-colors">{g.title}</span>
                <span className="block text-xs normal-case tracking-normal text-muted-foreground font-body">{g.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;