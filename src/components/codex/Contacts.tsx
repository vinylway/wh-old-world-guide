import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';
import OrnateDivider from './OrnateDivider';

const CONTACT_API_URL = 'https://functions.poehali.dev/f3e192da-0e95-4fe7-aa20-42757af165ec';

const Contacts = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Назовите своё имя, странник';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Неверный свиток связи (email)';
    if (form.message.trim().length < 10) e.message = 'Послание слишком коротко';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      toast({ title: 'Ворон отправлен!', description: 'Летописцы получат ваше послание.' });
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast({ title: 'Ворон не долетел', description: 'Попробуйте отправить послание ещё раз.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="section-contacts" className="scroll-mt-24 border-t border-gold/20 bg-secondary/30">
      <div className="container py-16 md:py-24">
        <div className="text-center mb-10">
          <span className="flex mx-auto h-14 w-14 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
            <Icon name="Feather" size={26} />
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">Контакты</h2>
          <p className="mt-3 font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Гильдия летописцев принимает предложения, поправки и просьбы. Отправьте нам весть.
          </p>
          <OrnateDivider className="mt-6" />
        </div>

        <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="space-y-5 font-body text-lg text-parchment/85">
            <p className="flex items-center gap-3"><Icon name="Mail" size={20} className="text-gold" /> loremaster-codex-oldworld@yandex.ru</p>
            <p className="flex items-center gap-3"><Icon name="MapPin" size={20} className="text-gold" /> Библиотека Храма Верены, Талагаад</p>
            <p className="flex items-center gap-3"><Icon name="Clock" size={20} className="text-gold" /> Свитки читаются от рассвета до заката</p>
            <p className="flex items-center gap-3"><Icon name="Users" size={20} className="text-gold" /> Сообщество мастеров игры</p>
            <a
              href="https://boosty.to/zelyonyykardinal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-gold transition-colors"
            >
              <Icon name="Heart" size={20} className="text-gold" /> Поддержать на Boosty
            </a>
          </div>

          <form onSubmit={submit} className="space-y-4 parchment-panel rounded border border-gold/25 p-6">
            <div>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
                className="w-full rounded border border-gold/25 bg-background/60 px-4 py-2.5 font-body text-parchment placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
              {errors.name && <p className="mt-1 font-body text-sm text-blood">{errors.name}</p>}
            </div>
            <div>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Свиток связи (email)"
                className="w-full rounded border border-gold/25 bg-background/60 px-4 py-2.5 font-body text-parchment placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
              {errors.email && <p className="mt-1 font-body text-sm text-blood">{errors.email}</p>}
            </div>
            <div>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Ваше послание…"
                rows={4}
                className="w-full rounded border border-gold/25 bg-background/60 px-4 py-2.5 font-body text-parchment placeholder:text-muted-foreground focus:border-gold focus:outline-none resize-none"
              />
              {errors.message && <p className="mt-1 font-body text-sm text-blood">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground hover-scale glow-gold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon name={loading ? 'Loader2' : 'Send'} size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Отправка…' : 'Отправить ворона'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contacts;