import Icon from '@/components/ui/icon';
import OrnateDivider from './OrnateDivider';

const Contacts = () => {
  return (
    <section id="section-contacts" className="scroll-mt-24 border-t border-gold/20 bg-secondary/30">
      <div className="container py-16 md:py-24">
        <div className="text-center mb-10">
          <span className="flex mx-auto h-14 w-14 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
            <Icon name="Feather" size={26} />
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">Контакты</h2>
          <p className="mt-3 font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Гильдия Летописцев принимает предложения, поправки и просьбы. Присоединяйтесь к нашей общине.
          </p>
          <OrnateDivider className="mt-6" />
        </div>

        <div className="max-w-md mx-auto space-y-5 font-body text-lg text-parchment/85">
          <p className="flex items-center gap-3"><Icon name="MapPin" size={20} className="text-gold" /> Гильдия Летописцев, Талагаад</p>
          <p className="flex items-center gap-3"><Icon name="Clock" size={20} className="text-gold" /> Свитки читаются от рассвета до заката</p>
          <p className="flex items-center gap-3"><Icon name="Users" size={20} className="text-gold" /> Сообщество для ведущих и героев</p>
          <a
            href="https://boosty.to/zelyonyykardinal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-gold transition-colors"
          >
            <Icon name="Heart" size={20} className="text-gold" /> Поддержать на Boosty
          </a>

          <a
            href="https://t.me/+AvSCOorT4ik3OTgy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded bg-gold px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground hover-scale glow-gold mt-8"
          >
            <Icon name="Send" size={18} /> Вступить в Telegram-группу
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
