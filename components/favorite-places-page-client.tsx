'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ServiceLocation } from '@/lib/data';
import { useLocale } from '@/lib/client-i18n';
import {
  getStoredFavoriteLocationIds,
  setStoredFavoriteLocationIds,
} from '@/lib/favorites';

type FavoritePlacesPageClientProps = {
  locations: ServiceLocation[];
};

const categoryColors: Record<string, string> = {
  hospital: '#f59e0b',
  gynecologist: '#8b5cf6',
  birthing_class: '#10b981',
  dietitian: '#f97316',
  psychologist: '#ec4899',
  physiotherapist: '#14b8a6',
  mops: '#3b82f6',
  store: '#eab308',
};

export function FavoritePlacesPageClient({
  locations,
}: FavoritePlacesPageClientProps) {
  const { t } = useLocale();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getStoredFavoriteLocationIds());
  }, []);

  const favoriteLocations = useMemo(
    () => locations.filter((location) => favoriteIds.includes(location.id)),
    [locations, favoriteIds]
  );

  const removeFavorite = (locationId: string) => {
    setFavoriteIds((current) => {
      const next = current.filter((id) => id !== locationId);

      setStoredFavoriteLocationIds(next);

      return next;
    });
  };

  const getCategoryLabel = (type: string) => {
    const categories = t.map.categories as Record<string, string>;

    return categories[type] ?? type;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">
          {t.favorites.title}
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.favorites.subtitle}
        </p>
      </div>

      {favoriteLocations.length === 0 ? (
        <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)] text-3xl">
            ♥
          </div>

          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {t.favorites.emptyTitle}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            {t.favorites.emptyDescription}
          </p>

          <Link
            href="/map"
            className="mt-6 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t.favorites.goToMap}
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favoriteLocations.map((location) => {
            const categoryColor =
              categoryColors[location.type] ?? 'var(--brand)';

            return (
              <article
                key={location.id}
                className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          color: categoryColor,
                          backgroundColor: `${categoryColor}18`,
                        }}
                      >
                        {getCategoryLabel(location.type)}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[var(--ink)]">
                      {location.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {location.address}, {location.city}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFavorite(location.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-lg text-[var(--brand-strong)] transition hover:opacity-80"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    ♥
                  </button>
                </div>

                {location.description && (
                  <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                    {location.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent)]"
                    >
                      {t.favorites.phone}
                    </a>
                  )}

                  {location.website && (
                    <a
                      href={location.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--accent)]"
                    >
                      {t.favorites.website}
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {t.favorites.openInGoogleMaps}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
