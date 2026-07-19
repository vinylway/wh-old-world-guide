import Icon from '@/components/ui/icon';
import OrnateDivider from './OrnateDivider';

const HERO_IMG = 'https://cdn.poehali.dev/projects/8ea67526-cf7e-472d-ad6c-bad53fcea4bc/files/daa84246-44d4-46ec-b56f-2459e24c5b69.jpg';

interface HeroProps {
  onSearchClick: () => void;
}

const Hero = ({ onSearchClick }: HeroProps) => {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />

      <div className="container relative py-24 md:py-36 text-center animate-fade-in">
        <p className="font-rune text-gold/80 tracking-[0.3em] uppercase text-sm mb-6 animate-flicker">
          Warhammer · The Old World · RPG
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-gradient-gold drop-shadow-[0_2px_20px_rgba(200,153,47,0.25)]">
          Кодекс<br className="md:hidden" /> Старого Света
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
          <button
            onClick={() => document.getElementById('sections')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-3 rounded border border-gold/40 px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
          >
            <Icon name="BookOpen" size={18} />
            Открыть разделы
          </button>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-display text-sm uppercase tracking-widest text-parchment/60">
          <span className="flex items-center gap-2"><Icon name="ScrollText" size={16} className="text-gold" /> 7 разделов</span>
          <span className="flex items-center gap-2"><Icon name="Search" size={16} className="text-gold" /> Полнотекстовый поиск</span>
          <span className="flex items-center gap-2"><Icon name="Skull" size={16} className="text-gold" /> Бестиарий</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
