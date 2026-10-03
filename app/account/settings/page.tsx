'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/lib/client-i18n';

const HomeLocationMap = dynamic(
  () =>
    import('@/components/home-location-map').then(
      (module) => module.HomeLocationMap
    ),
  { ssr: false }
);

const PREGNANCY_WEEK_STORAGE_KEY = 'weekOfPregnancy';
const HOME_LOCATION_STORAGE_KEY = 'homeLocation';

type StoredLocation = { lat: number; lng: number };

function getStoredPregnancyWeek(): number {
  if (typeof window === 'undefined') {
    return 20;
  }

  const storedWeek = Number(window.localStorage.getItem(PREGNANCY_WEEK_STORAGE_KEY) ?? '20');
  return Number.isFinite(storedWeek) ? Math.min(40, Math.max(1, storedWeek)) : 20;
}

function getStoredHomeLocation(): StoredLocation | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocation = window.localStorage.getItem(HOME_LOCATION_STORAGE_KEY);
  if (!storedLocation) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedLocation) as Partial<StoredLocation>;
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lng === 'number' &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveLocationAddress(latitude: number, longitude: number, locale: 'pl' | 'en') {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { headers: { 'Accept-Language': locale === 'pl' ? 'pl' : 'en' } }
    );
    const data = await response.json();
    const address = data?.address;

    const street =
      address?.road ||
      address?.pedestrian ||
      address?.footway ||
      address?.path ||
      address?.residential ||
      address?.street;

    const houseNumber = address?.house_number || address?.building || address?.entrance;
    const locality =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.municipality ||
      address?.suburb ||
      address?.county ||
      address?.state ||
      address?.country;

    const streetWithNumber = street && houseNumber ? `${street} ${houseNumber}` : street ?? houseNumber;

    if (streetWithNumber && locality) {
      return `${streetWithNumber}, ${locality}`;
    }

    if (streetWithNumber) {
      return streetWithNumber;
    }

    if (locality) {
      return locality;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale();
  const [week, setWeek] = useState<number>(20);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [homeLocation, setHomeLocation] = useState<StoredLocation | null>(null);
  const [homeLocationLabel, setHomeLocationLabel] = useState<string | null>(null);
  const defaultHomeLocation = useMemo<StoredLocation>(() => ({ lat: 52.237, lng: 19.017 }), []);

  useEffect(() => {
    const storedWeek = getStoredPregnancyWeek();
    const storedHomeLocation = getStoredHomeLocation();
    const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;

    setWeek(storedWeek);
    setHomeLocation(storedHomeLocation);
    if (storedTheme === 'light' || storedTheme === 'dark') setTheme(storedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PREGNANCY_WEEK_STORAGE_KEY, String(week));
  }, [week]);

  useEffect(() => {
    if (homeLocation) {
      window.localStorage.setItem(HOME_LOCATION_STORAGE_KEY, JSON.stringify(homeLocation));
      void resolveLocationAddress(homeLocation.lat, homeLocation.lng, locale).then(setHomeLocationLabel);
      return;
    }

    window.localStorage.removeItem(HOME_LOCATION_STORAGE_KEY);
    setHomeLocationLabel(null);
  }, [homeLocation, locale]);

  const setCurrentLocationAsHome = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setHomeLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-2 md:px-0">
      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <h1 className="text-3xl font-black text-[var(--brand-strong)]">{t.settings.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t.settings.subtitle}</p>
      </section>

      <section className="card mobile-card rounded-[1.6rem] p-5">
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{t.settings.language}</label>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as 'pl' | 'en')}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 outline-none"
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
      </section>

      <section className="card mobile-card rounded-[1.6rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{t.settings.theme}</div>
            <div className="mt-1 text-xl font-bold text-[var(--brand-strong)]">{theme === 'dark' ? t.settings.dark : t.settings.light}</div>
          </div>
          <button
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white"
          >
            {t.common.change}
          </button>
        </div>
      </section>

      <section className="card mobile-card rounded-[1.6rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{t.settings.homeLocation}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              {homeLocation ? (homeLocationLabel ?? `${homeLocation.lat.toFixed(4)}, ${homeLocation.lng.toFixed(4)}`) : t.settings.homeLocationNotSet}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={setCurrentLocationAsHome}
              className="rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t.settings.useCurrentLocationAsHome}
            </button>
            {homeLocation && (
              <button
                type="button"
                onClick={() => setHomeLocation(null)}
                className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)]"
              >
                {t.settings.clearHomeLocation}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-[var(--line)]">
          <HomeLocationMap
            value={homeLocation ?? defaultHomeLocation}
            onChange={setHomeLocation}
          />
        </div>
      </section>

      <section className="card mobile-card rounded-[1.6rem] p-5">
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{t.settings.pregnancyWeek}</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={40}
            value={week}
            onChange={(event) => setWeek(Number(event.target.value))}
            className="w-full accent-[var(--brand)]"
            aria-label="Set pregnancy week"
          />
          <div className="min-w-12 text-right text-2xl font-black text-[var(--brand-strong)]">{week}</div>
        </div>
      </section>
    </div>
  );
}
