'use client';

import { useEffect } from 'react';
import { useLocale } from '@/lib/client-i18n';

function TawkWidget() {
  useEffect(() => {
    if (document.getElementById('tawk-script')) return;

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.src = 'https://embed.tawk.to/6ac1a9686238bf34c4307e5c/1k427rfts';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
  }, []);

  return null;
}

export default function ContactPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <TawkWidget />

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl">💬</div>
          <div>
            <h1 className="text-3xl font-black text-[var(--brand-strong)]">{t.contact.title}</h1>
            <p className="text-sm text-[var(--muted)]">{t.contact.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card mobile-card rounded-[1.6rem] p-5">
          <h2 className="text-xl font-black text-[var(--brand-strong)]">{t.contact.urgent}</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>{t.contact.hotline}: <strong className="text-[var(--brand-strong)]"><a href={`tel:${t.contact.hotlineValue}`}>{t.contact.hotlineValue}</a></strong></li>
            <li>{t.contact.psychologist}: <strong className="text-[var(--brand-strong)]"><a href={`tel:${t.contact.psychologistValue}`}>{t.contact.psychologistValue}</a></strong></li>
            <li>{t.contact.social}: <strong className="text-[var(--brand-strong)]"><a href={`tel:${t.contact.socialValue}`}>{t.contact.socialValue}</a></strong></li>
            <li>{t.contact.emergency}: <strong className="text-[var(--brand-strong)]"><a href={`tel:${t.contact.emergencyValue}`}>{t.contact.emergencyValue}</a></strong></li>
          </ul>
        </div>

        <div className="card mobile-card rounded-[1.6rem] p-5">
          <h2 className="text-xl font-black text-[var(--brand-strong)]">{t.contact.talk}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{t.contact.talkBody}</p>
          <div className="mt-4 rounded-2xl bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">
            <strong className="text-[var(--brand-strong)]">{t.contact.writeToUs}:</strong> <a href={`mailto:${t.contact.emailValue}`}>{t.contact.emailValue}</a>
          </div>
        </div>
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <h2 className="text-2xl font-black text-[var(--brand-strong)]">{t.contact.liveChat}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{t.contact.liveChatBody}</p>
      </section>
    </div>
  );
}
