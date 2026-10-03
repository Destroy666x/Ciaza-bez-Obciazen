export type Locale = 'en' | 'pl';

export const DEFAULT_LOCALE: Locale = 'en';

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'pl' || value === 'en' ? value : DEFAULT_LOCALE;
}

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : null;
}

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('locale', locale);
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const localValue = window.localStorage.getItem('locale');
  const cookieValue = getCookieValue('locale');
  return normalizeLocale(localValue ?? cookieValue ?? DEFAULT_LOCALE);
}

export function getLocaleFromCookies(cookieStore?: { get?: (name: string) => { value?: string } | undefined } | null): Locale {
  const value = cookieStore?.get?.('locale')?.value ?? null;
  return normalizeLocale(value ?? null);
}

export const translations = {
  en: {
    appName: 'Pregnancy Without Burden',
    supportEveryWeek: 'Support for every week',
    tabs: {
      knowledge: 'Knowledge base',
      map: 'Map',
      timeline: 'Timeline',
      contact: 'Contact',
      settings: 'Settings',
      favorites: 'Favorite places',
    },
    actions: {
      login: 'Log in',
      register: 'Register',
      read: 'Read',
      viewAll: 'View all',
      returnHome: 'Return home',
    },
    home: {
      badge: 'Support for every stage',
      headline: 'Pregnancy Without Burden',
      description: 'Verified information, local services, help maps and a plan for every week of pregnancy — all in one mobile-first prototype.',
      primaryCta: 'Open knowledge base',
      secondaryCta: 'Find local help',
      week: 'Pregnancy week',
      mapCount: 'Maps',
      articleCount: 'Articles',
      cards: {
        knowledge: 'Knowledge base',
        knowledgeBody: 'Articles on health, law, finances and work',
        map: 'Support map',
        mapBody: 'Local clinics and specialists across Poland',
        timeline: 'Pregnancy plan',
        timelineBody: 'Calendar and guidance for each week of pregnancy',
      },
      featured: 'Key articles',
      featuredEmpty: 'No featured stories yet',
    },
    knowledge: {
      title: 'Knowledge base',
      subtitle: 'Useful information and support in a clear, reassuring format for future mothers.',
      read: 'Read',
      categories: 'Categories',
    },
    map: {
      title: 'Support map',
      subtitle: 'Local and regional services that help during pregnancy and early motherhood.',
      route: 'Route to destination',
      uber: 'Uber',
      bolt: 'Bolt',
      mapView: 'Map view',
      currentLocation: 'Current location: {value}',
      locationNotShared: 'Location not shared yet',
      useMyLocation: 'Use my location',
      useHomeLocation: 'Use home location',
      showAllCategories: 'Show all categories',
      radiusFilter: 'Radius filter',
      enableRadiusFilter: 'Enable radius filter',
      onlyOpenBusinesses: 'Only open businesses',
      openNow: 'Open now',
      closedNow: 'Closed now',
      hours: 'Hours',
      days: {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun',
      },
      allLocations: 'All locations',
      locationAccessUnavailable: 'Location access is unavailable in this browser.',
      permissionDenied: 'Permission to use your location was denied.',
      categories: {
        hospital: 'Hospitals and clinics',
        gynecologist: 'Gynecologists',
        birthing_class: 'Parenting classes',
        dietitian: 'Dietitians',
        psychologist: 'Psychologists and psychiatrists',
        physiotherapist: 'Physiotherapists',
        mops: 'MOPS',
        store: 'Stores for mothers and babies',
      },
    },
    timeline: {
      title: 'Pregnancy timeline',
      subtitle: 'You are in week {week}. Here are the most important milestones and reminders.',
      currentWeek: 'Current week',
      progress: '{value}% of the journey',
      activeStage: 'Active stage',
      important: 'Important',
      viewEntry: 'View article',
      weekLabel: 'Week {week}',
      jumpToArticle: 'Go to article',
    },
    contact: {
      title: 'Support and contact',
      subtitle: 'If you need help, there are real-world channels for quick support.',
      urgent: 'Urgent contacts',
      hotline: 'Pregnancy support hotline',
      hotlineValue: '116 123',
      psychologist: 'Psychological support centre',
      psychologistValue: '+48 22 123 45 67',
      social: 'Social support and MOPS',
      socialValue: '+48 22 765 45 12',
      emergency: 'Danger or immediate risk',
      emergencyValue: '112',
      talk: 'Sometimes it helps to talk',
      talkBody: 'A conversation with a midwife, psychologist or advisor can help you organise care, answer questions and plan the next steps.',
      writeToUs: 'Write to us',
      emailValue: 'support@pregnancy-support.pl',
      liveChat: 'Live chat',
      liveChatBody: 'The Tawk.to widget appears on the right side of the app to help answer questions and guide people to support.',
    },
    settings: {
      title: 'Account settings',
      subtitle: 'Adjust language, theme, home location and your current pregnancy week.',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      homeLocation: 'Home location',
      homeLocationNotSet: 'Not set yet',
      useCurrentLocationAsHome: 'Set current location',
      clearHomeLocation: 'Clear',
      pregnancyWeek: 'Pregnancy week',
    },
    auth: {
      loginTitle: 'Log in',
      loginSubtitle: 'Log in to your profile and monitor your pregnancy plan.',
      email: 'E-mail',
      emailPlaceholder: 'name@example.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      passwordHint: 'Minimum 8 characters',
      noAccount: 'No account yet?',
      createAccount: 'Create one',
      registerTitle: 'Registration',
      registerSubtitle: 'Create an account to save settings and receive personalised reminders.',
      firstName: 'First name',
      firstNamePlaceholder: 'Anna',
      createAccountButton: 'Create account',
      alreadyHaveAccount: 'Already have an account?',
      loginButton: 'Log in',
    },
    common: {
      change: 'Change',
      save: 'Save',
      readMore: 'Read more',
      back: 'Back',
      or: 'or',
      enable: 'Enable',
      collapse: 'Collapse',
      expand: 'Expand',
    },
  },
  pl: {
    appName: 'Ciąża bez Obciążeń',
    supportEveryWeek: 'Wsparcie na każdy tydzień',
    tabs: {
      knowledge: 'Centrum wiedzy',
      map: 'Mapa',
      timeline: 'Oś czasu',
      contact: 'Kontakt',
      settings: 'Ustawienia',
      favorites: 'Ulubione miejsca',
    },
    actions: {
      login: 'Zaloguj',
      register: 'Rejestracja',
      read: 'Czytaj',
      viewAll: 'Zobacz wszystkie',
      returnHome: 'Wróć do strony głównej',
    },
    home: {
      badge: 'Wsparcie na każdy etap',
      headline: 'Ciąża bez Obciążeń',
      description: 'Sprawdzone informacje, lokalne usługi, mapy pomocy i plan na każdy tydzień ciąży — wszystko w jednym mobilnym prototypie.',
      primaryCta: 'Otwórz centrum wiedzy',
      secondaryCta: 'Znajdź pomoc w okolicy',
      week: 'Tydzień ciąży',
      mapCount: 'Mapa',
      articleCount: 'Artykuły',
      cards: {
        knowledge: 'Centrum wiedzy',
        knowledgeBody: 'Artykuły o zdrowiu, prawie, finansach i pracy',
        map: 'Mapa wsparcia',
        mapBody: 'Lokalne placówki i specjaliści w całej Polsce',
        timeline: 'Plan ciąży',
        timelineBody: 'Kalendarz i wpisy dla kolejnych tygodni ciąży',
      },
      featured: 'Najważniejsze wpisy',
      featuredEmpty: 'Brak wpisów',
    },
    knowledge: {
      title: 'Centrum wiedzy',
      subtitle: 'Przydatne informacje i wsparcie w języku zrozumiałym dla przyszłych mam.',
      read: 'Czytaj',
      categories: 'Kategorie',
    },
    map: {
      title: 'Mapa usług',
      subtitle: 'Lokalne i regionalne placówki pomocne w ciąży i pierwszych miesiącach po porodzie.',
      route: 'Trasa do miejsca',
      uber: 'Uber',
      bolt: 'Bolt',
      mapView: 'Widok mapy',
      currentLocation: 'Obecna lokalizacja: {value}',
      locationNotShared: 'Lokalizacja nie została jeszcze udostępniona',
      useMyLocation: 'Użyj mojej lokalizacji',
      useHomeLocation: 'Użyj lokalizacji domowej',
      showAllCategories: 'Pokaż wszystkie kategorie',
      radiusFilter: 'Filtr odległości',
      enableRadiusFilter: 'Włącz filtr odległości',
      onlyOpenBusinesses: 'Tylko otwarte firmy',
      openNow: 'Otwarte teraz',
      closedNow: 'Zamknięte teraz',
      hours: 'Godziny',
      days: {
        monday: 'Pon',
        tuesday: 'Wt',
        wednesday: 'Śr',
        thursday: 'Czw',
        friday: 'Pt',
        saturday: 'Sob',
        sunday: 'Ndz',
      },
      allLocations: 'Wszystkie lokalizacje',
      locationAccessUnavailable: 'Dostęp do lokalizacji nie jest dostępny w tej przeglądarce.',
      permissionDenied: 'Odmówiono dostępu do Twojej lokalizacji.',
      categories: {
        hospital: 'Szpitale i kliniki',
        gynecologist: 'Ginekologowie',
        birthing_class: 'Zajęcia rodzicielskie',
        dietitian: 'Dietetycy',
        psychologist: 'Psychologowie i psychiatrzy',
        physiotherapist: 'Fizjoterapeuci',
        mops: 'MOPS',
        store: 'Sklepy dla mam i dzieci',
      },
    },
    timeline: {
      title: 'Oś czasu ciąży',
      subtitle: 'Przeżywasz {week}. tydzień ciąży. Oto najważniejsze momenty i przypomnienia.',
      currentWeek: 'Aktualny tydzień',
      progress: '{value}% etapu',
      activeStage: 'Aktywny etap',
      important: 'Ważne',
      viewEntry: 'Zobacz wpis',
      weekLabel: 'Tydzień {week}',
      jumpToArticle: 'Przejdź do artykułu',
    },
    contact: {
      title: 'Kontakt i wsparcie',
      subtitle: 'Jeżeli potrzebujesz pomocy, są realne kanały szybkiego wsparcia.',
      urgent: 'Pilne kontakty',
      hotline: 'Telefon zaufania dla kobiet w ciąży',
      hotlineValue: '116 123',
      psychologist: 'Centrum pomocy psychologicznej',
      psychologistValue: '+48 22 123 45 67',
      social: 'Pomoc socjalna i MOPS',
      socialValue: '+48 22 765 45 12',
      emergency: 'Niebezpieczeństwo lub nagłe zagrożenie',
      emergencyValue: '112',
      talk: 'Czasem warto porozmawiać',
      talkBody: 'Rozmowa z położną, psychologiem lub doradcą może ułatwić zorganizowanie opieki, potwierdzenie pytań i plan dalszych kroków.',
      writeToUs: 'Napisz do nas',
      emailValue: 'support@pregnancy-support.pl',
      liveChat: 'Chat na żywo',
      liveChatBody: 'Po prawej stronie aplikacji uruchomiony jest widget Tawk.to, gotowy do obsługi pytań i kierowania do pomocy.',
    },
    settings: {
      title: 'Ustawienia konta',
      subtitle: 'Dostosuj język, motyw, lokalizację domową i aktualny tydzień ciąży do swoich potrzeb.',
      language: 'Język',
      theme: 'Motyw',
      light: 'Jasny',
      dark: 'Ciemny',
      homeLocation: 'Lokalizacja domowa',
      homeLocationNotSet: 'Jeszcze nie ustawiono',
      useCurrentLocationAsHome: 'Ustaw bieżącą lokalizację',
      clearHomeLocation: 'Wyczyść',
      pregnancyWeek: 'Tydzień ciąży',
    },
    auth: {
      loginTitle: 'Logowanie',
      loginSubtitle: 'Zaloguj się do swojego profilu i śledź swój plan ciąży.',
      email: 'E-mail',
      emailPlaceholder: 'twoj@email.com',
      password: 'Hasło',
      passwordPlaceholder: '••••••••',
      passwordHint: 'Minimum 8 znaków',
      noAccount: 'Nie masz konta?',
      createAccount: 'Utwórz konto',
      registerTitle: 'Rejestracja',
      registerSubtitle: 'Załóż konto, aby zapisywać ustawienia i otrzymywać spersonalizowane przypomnienia.',
      firstName: 'Imię',
      firstNamePlaceholder: 'Anna',
      createAccountButton: 'Utwórz konto',
      alreadyHaveAccount: 'Masz już konto?',
      loginButton: 'Zaloguj się',
    },
    common: {
      change: 'Zmień',
      save: 'Zapisz',
      readMore: 'Czytaj więcej',
      back: 'Wstecz',
      or: 'lub',
      enable: 'Włącz',
      collapse: 'Zwiń',
      expand: 'Rozwiń',
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return translations[locale];
}
