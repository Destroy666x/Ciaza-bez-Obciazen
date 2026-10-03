'use client';

import Link from 'next/link';
import type { Article } from '@/lib/data';
import { useLocale } from '@/lib/client-i18n';

export function HomePageClient({ articles, locationCount }: { articles: Article[]; locationCount: number }) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <section className="card mobile-card overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.5fr_0.8fr] md:items-center">
          <div>
            <span className="inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
              {t.home.badge}
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--brand-strong)] md:text-5xl">
              {t.home.headline}
            </h1>
            <p className="mt-4 max-w-xl text-base text-[var(--muted)] md:text-lg">
              {t.home.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/knowledge-base" className="rounded-full bg-[var(--brand-strong)] px-5 py-3 text-center font-semibold text-white shadow-soft">
                {t.home.primaryCta}
              </Link>
              <Link href="/map" className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-center font-semibold text-[var(--brand-strong)]">
                {t.home.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] bg-[var(--panel-soft)] p-4">
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{t.home.week}</div>
              <div className="mt-2 text-3xl font-black text-[var(--brand-strong)]">20</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{t.home.description}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
              <div className="rounded-2xl bg-white p-3 shadow-soft">
                <div className="text-xs uppercase tracking-[0.12em]">{t.home.mapCount}</div>
                <div className="mt-2 text-2xl font-black text-[var(--brand-strong)]">{locationCount}</div>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-soft">
                <div className="text-xs uppercase tracking-[0.12em]">{t.home.articleCount}</div>
                <div className="mt-2 text-2xl font-black text-[var(--brand-strong)]">{articles.length + 2}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: t.home.cards.knowledge, body: t.home.cards.knowledgeBody, href: '/knowledge-base', icon: '📚' },
          { title: t.home.cards.map, body: t.home.cards.mapBody, href: '/map', icon: '📍' },
          { title: t.home.cards.timeline, body: t.home.cards.timelineBody, href: '/pregnancy-timeline', icon: '🗓️' },
        ].map((item) => (
          <Link key={item.title} href={item.href} className="card mobile-card rounded-[1.6rem] p-5 transition hover:-translate-y-0.5">
            <div className="mb-4 text-3xl">{item.icon}</div>
            <h2 className="text-xl font-bold text-[var(--brand-strong)]">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.body}</p>
          </Link>
        ))}
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-[var(--brand-strong)]">{t.home.featured}</h2>
          <Link href="/knowledge-base" className="text-sm font-semibold text-[var(--brand)]">{t.actions.viewAll}</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/knowledge-base/${article.slug}`} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{article.category}</div>
              <h3 className="text-lg font-bold text-[var(--brand-strong)]">{article.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{article.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
