'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_LOCALE,
  getDictionary,
  getStoredLocale,
  persistLocale,
  type Locale,
} from '@/lib/i18n';

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const syncLocale = () => setLocaleState(getStoredLocale());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'locale') {
        syncLocale();
      }
    };

    syncLocale();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localechange', syncLocale);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localechange', syncLocale);
    };
  }, []);

  const setLocale = (nextLocale: Locale) => {
    const normalized = nextLocale === 'pl' || nextLocale === 'en' ? nextLocale : DEFAULT_LOCALE;
    setLocaleState(normalized);
    persistLocale(normalized);
    window.dispatchEvent(new CustomEvent('localechange', { detail: normalized }));
  };

  return {
    locale,
    setLocale,
    t: getDictionary(locale),
  };
}
