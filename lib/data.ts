import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export type Locale = 'en' | 'pl';

type LocalizedValue<T> = T | Partial<Record<Locale, T>>;

export type ArticleCategory = {
  slug: string;
  parent?: string;
  title: string;
  description: string;
  kind: string;
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
  links: { label: string; url: string }[];
  tags: string[];
};

export type OpeningHours = Partial<Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', string | string[]>>;

export type ServiceLocation = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  address: string;
  rating: number;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  description: string;
  opening_hours?: OpeningHours;
};

export type PregnancyMilestone = {
  week: number;
  title: string;
  summary: string;
  article: string;
};

function loadYaml<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(fileContent) as T;
}

function getLocalizedValue<T>(value: LocalizedValue<T> | undefined, locale: Locale, fallback?: T): T | undefined {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'pl' in value)) {
    const entry = value as Partial<Record<Locale, T>>;
    return entry[locale] ?? entry.en ?? entry.pl ?? fallback;
  }

  return value as T;
}

function getLocalizedString(value: LocalizedValue<string> | undefined, locale: Locale, fallback = ''): string {
  return String(getLocalizedValue(value, locale, fallback) ?? fallback);
}

function getLocalizedStrings(value: LocalizedValue<string[]> | undefined, locale: Locale, fallback: string[] = []): string[] {
  const resolved = getLocalizedValue(value, locale, fallback);
  return Array.isArray(resolved) ? resolved.map((entry) => String(entry)) : fallback;
}

function getLocalizedLinks(value: unknown, locale: Locale): { label: string; url: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    if (!entry || typeof entry !== 'object') {
      return { label: '', url: '' };
    }

    const item = entry as Record<string, unknown>;
    return {
      label: getLocalizedString(item.label as LocalizedValue<string> | undefined, locale),
      url: getLocalizedString(item.url as LocalizedValue<string> | undefined, locale),
    };
  }).filter((link) => link.label || link.url);
}

type CategoryRecord = {
  slug?: unknown;
  parent?: unknown;
  title?: LocalizedValue<string>;
  description?: LocalizedValue<string>;
  kind?: LocalizedValue<string>;
};

type ArticleRecord = {
  slug?: unknown;
  category?: unknown;
  title?: LocalizedValue<string>;
  summary?: LocalizedValue<string>;
  content?: LocalizedValue<string[]>;
  links?: unknown;
  tags?: LocalizedValue<string[]>;
};

export function getCategories(locale: Locale = 'en'): ArticleCategory[] {
  const categories = loadYaml<{ categories: CategoryRecord[] }>('categories.yaml').categories;

  return categories.map((category: CategoryRecord) => ({
    slug: String(category.slug ?? ''),
    parent: category.parent ? String(category.parent) : undefined,
    title: getLocalizedString(category.title, locale),
    description: getLocalizedString(category.description, locale),
    kind: getLocalizedString(category.kind, locale),
  }));
}

export function getTopLevelCategories(locale: Locale = 'en'): ArticleCategory[] {
  return getCategories(locale).filter((category) => !category.parent);
}

export function getArticles(locale: Locale = 'en'): Article[] {
  const articles = loadYaml<{ articles: ArticleRecord[] }>('articles.yaml').articles;

  return articles.map((article: ArticleRecord) => ({
    slug: String(article.slug ?? ''),
    category: String(article.category ?? ''),
    title: getLocalizedString(article.title, locale, String(article.title ?? '')),
    summary: getLocalizedString(article.summary, locale, String(article.summary ?? '')),
    content: getLocalizedStrings(
      article.content,
      locale,
      Array.isArray(article.content) ? article.content.map((entry: unknown) => String(entry)) : []
    ),
    links: getLocalizedLinks(article.links, locale),
    tags: getLocalizedStrings(
      article.tags,
      locale,
      Array.isArray(article.tags) ? article.tags.map((entry: unknown) => String(entry)) : []
    ),
  }));
}

export function getLocations(): ServiceLocation[] {
  return loadYaml<{ locations: ServiceLocation[] }>('locations.yaml').locations;
}

export function getTimeline(): PregnancyMilestone[] {
  return loadYaml<{ milestones: PregnancyMilestone[] }>('timeline.yaml').milestones;
}

export function getArticleBySlug(slug: string, locale: Locale = 'en'): Article | undefined {
  const matches = getArticles(locale).filter((article) => article.slug === slug);

  if (matches.length > 0) {
    return matches[0];
  }

  if (locale !== 'pl') {
    return getArticleBySlug(slug, 'pl');
  }

  return undefined;
}

export function getFeaturedArticles(limit = 3, locale: Locale = 'en'): Article[] {
  return getArticles(locale).slice(0, limit);
}
