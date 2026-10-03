'use client';

import dynamic from 'next/dynamic';
import type { ServiceLocation } from '@/lib/data';
import { useLocale } from '@/lib/client-i18n';

const ServiceMap = dynamic(() => import('@/components/service-map').then((module) => module.ServiceMap), {
  ssr: false,
  loading: () => <div className="card mobile-card h-[480px] rounded-[1.6rem] p-4 text-sm text-[var(--muted)]">Loading map…</div>,
});

export function MapPageClient({ locations }: { locations: ServiceLocation[] }) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sage)] text-2xl">📍</div>
          <div>
            <h1 className="text-3xl font-black text-[var(--brand-strong)]">{t.map.title}</h1>
            <p className="text-sm text-[var(--muted)]">{t.map.subtitle}</p>
          </div>
        </div>
      </section>

      <ServiceMap locations={locations} />
    </div>
  );
}
