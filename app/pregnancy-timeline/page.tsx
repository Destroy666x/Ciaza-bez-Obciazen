'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/client-i18n';

const PREGNANCY_WEEK_STORAGE_KEY = 'weekOfPregnancy';

function getStoredPregnancyWeek(): number {
  if (typeof window === 'undefined') {
    return 20;
  }

  const storedWeek = Number(window.localStorage.getItem(PREGNANCY_WEEK_STORAGE_KEY) ?? '20');
  return Number.isFinite(storedWeek) ? Math.min(40, Math.max(1, storedWeek)) : 20;
}

const milestones = [
  { week: 8, title: 'First prenatal visit', summary: 'Confirm the pregnancy plan and schedule the first medical check-up.', article: 'zdrowie/jak-zaplanowac-badania' },
  { week: 12, title: 'First trimester review', summary: 'Lab tests and early assessment of fetal development.', article: 'zdrowie/jak-zaplanowac-badania' },
  { week: 20, title: 'Ultrasound and care plan', summary: 'An important moment for checking development and discussing the birth plan.', article: 'zdrowie/jak-zaplanowac-badania' },
  { week: 28, title: 'Third trimester preparation', summary: 'Health check, birth plan and discussion of early postnatal care.', article: 'zdrowie/jak-zaplanowac-badania' },
  { week: 32, title: 'Mental support and simple planning', summary: 'Reduce stress, plan support and organise the day-to-day routine.', article: 'zdrowie/zdrowie-psychiczne' },
  { week: 36, title: 'Birth is approaching', summary: 'Finish important appointments and prepare a practical support plan.', article: 'prawo/zwolnienie-od-pracy' },
  { week: 40, title: 'Due date and early postpartum days', summary: 'Support, care plan and preparation for the next life stage.', article: 'praca/plan-powrotu-do-pracy' },
];

export default function TimelinePage() {
  const { t } = useLocale();
  const [week, setWeek] = useState<number>(() => getStoredPregnancyWeek());

  useEffect(() => {
    window.localStorage.setItem(PREGNANCY_WEEK_STORAGE_KEY, String(week));
  }, [week]);

  const progress = Math.min(100, (week / 40) * 100);
  const activeMilestone = milestones.filter((milestone) => milestone.week <= week).at(-1) ?? milestones[0];

  return (
    <div className="space-y-6">
      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl">🗓️</div>
          <div>
            <h1 className="text-3xl font-black text-[var(--brand-strong)]">{t.timeline.title}</h1>
            <p className="text-sm text-[var(--muted)]">{t.timeline.subtitle.replace('{week}', String(week))}</p>
          </div>
        </div>
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.timeline.currentWeek}</div>
            <div className="text-4xl font-black text-[var(--brand-strong)]">{week}</div>
          </div>
          <div className="rounded-full bg-[var(--sage)] px-3 py-1 text-sm font-semibold text-[var(--brand-strong)]">{t.timeline.progress.replace('{value}', String(Math.round(progress)))} </div>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min={1}
            max={40}
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="w-full accent-[var(--brand)]"
            aria-label="Select pregnancy week"
          />
          <div className="mt-3 flex justify-between text-[11px] font-medium text-[var(--muted)]">
            <span>1</span>
            <span>20</span>
            <span>40</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-[var(--line)]" />
            <div className="absolute left-0 top-5 h-1 rounded-full bg-[var(--sage)]" style={{ width: `${progress}%` }} />
            <div className="relative flex items-start justify-between gap-2">
              {milestones.map((milestone) => {
                const isPast = milestone.week <= week;
                const isCurrent = milestone.week === week;

                return (
                  <div key={milestone.week} className="flex w-1/7 min-w-0 flex-col items-center text-center">
                    <div
                      className={`mt-2 h-5 w-5 rounded-full border-4 ${
                        isPast
                          ? 'border-[var(--sage)] bg-[var(--sage)]'
                          : isCurrent
                            ? 'border-[var(--brand)] bg-[var(--brand)]'
                            : 'border-[var(--line)] bg-[var(--panel)]'
                      }`}
                    />
                    <div className="mt-3 text-[10px] font-black text-[var(--brand-strong)]">{milestone.week}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <h2 className="text-2xl font-black text-[var(--brand-strong)]">{t.timeline.activeStage}</h2>
        <div className="mt-4 rounded-[1.5rem] bg-[var(--panel-soft)] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.timeline.important}</div>
          <h3 className="mt-2 text-2xl font-bold text-[var(--brand-strong)]">{activeMilestone.title}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{activeMilestone.summary}</p>
          <Link href={`/knowledge-base/${activeMilestone.article}`} className="mt-4 inline-flex rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white">
            {t.timeline.viewEntry}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone.week} className={`card mobile-card rounded-[1.5rem] p-4 ${milestone.week <= week ? 'border border-[var(--brand)]' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.timeline.weekLabel.replace('{week}', String(milestone.week))}</div>
                <h3 className="mt-2 text-xl font-bold text-[var(--brand-strong)]">{milestone.title}</h3>
              </div>
              {milestone.week <= week && <span className="rounded-full bg-[var(--sage)] px-3 py-1 text-xs font-bold text-[var(--brand-strong)]">{t.timeline.important}</span>}
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{milestone.summary}</p>
            <Link href={`/knowledge-base/${milestone.article}`} className="mt-3 inline-flex text-sm font-semibold text-[var(--brand)]">
              {t.timeline.jumpToArticle} →
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
