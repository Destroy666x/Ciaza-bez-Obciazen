import type { Locale } from '@/lib/i18n';

export type ArticleLink = {
  label: string;
  url: string;
};

export type LocalizedArticle = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
  links: ArticleLink[];
  tags: string[];
  translations?: Record<Locale, {
    title: string;
    summary: string;
    content: string[];
    links: ArticleLink[];
    tags: string[];
  }>;
};

export type LocalizedCategory = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  translations?: Record<Locale, { title: string; description: string; kind: string }>;
};

type TranslationShape = {
  title?: unknown;
  summary?: unknown;
  description?: unknown;
  content?: unknown;
  links?: unknown;
  tags?: unknown;
  kind?: unknown;
};

type CategoryLike = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  kind?: unknown;
  translations?: Partial<Record<Locale, TranslationShape>>;
};

type ArticleLike = {
  slug?: unknown;
  category?: unknown;
  title?: unknown;
  summary?: unknown;
  content?: unknown;
  links?: unknown;
  tags?: unknown;
  translations?: Partial<Record<Locale, TranslationShape>>;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeLinks(value: unknown): ArticleLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const item = entry as { label?: unknown; url?: unknown };
      const label = asString(item.label);
      const url = asString(item.url);
      if (!label && !url) return null;
      return { label, url };
    })
    .filter((entry): entry is ArticleLink => Boolean(entry));
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => asString(tag)).filter(Boolean);
}

export function normalizeCategory(category: CategoryLike | null | undefined, locale: Locale): LocalizedCategory {
  const translation = category?.translations?.[locale];
  const sourceTitle = asString(translation?.title ?? category?.title);
  const sourceDescription = asString(translation?.description ?? category?.description);
  const sourceKind = asString(translation?.kind ?? category?.kind);

  const normalizedTranslations: Record<Locale, { title: string; description: string; kind: string }> = {
    en: {
      title: asString(category?.translations?.en?.title ?? category?.title ?? sourceTitle),
      description: asString(category?.translations?.en?.description ?? category?.description ?? sourceDescription),
      kind: asString(category?.translations?.en?.kind ?? category?.kind ?? sourceKind),
    },
    pl: {
      title: asString(category?.translations?.pl?.title ?? category?.title ?? sourceTitle),
      description: asString(category?.translations?.pl?.description ?? category?.description ?? sourceDescription),
      kind: asString(category?.translations?.pl?.kind ?? category?.kind ?? sourceKind),
    },
  };

  return {
    slug: asString(category?.slug),
    title: sourceTitle,
    description: sourceDescription,
    kind: sourceKind,
    translations: category?.translations ? normalizedTranslations : undefined,
  };
}

export function normalizeArticle(article: ArticleLike | null | undefined, locale: Locale): LocalizedArticle {
  const translation = article?.translations?.[locale];
  const sourceTitle = asString(translation?.title ?? article?.title);
  const sourceSummary = asString(translation?.summary ?? article?.summary);
  const sourceContent = Array.isArray(translation?.content)
    ? translation.content.map((item: unknown) => asString(item))
    : Array.isArray(article?.content)
      ? article.content.map((item: unknown) => asString(item))
      : [];
  const sourceLinks = normalizeLinks(translation?.links ?? article?.links);
  const sourceTags = normalizeTags(translation?.tags ?? article?.tags);

  const normalizedTranslations: Record<Locale, { title: string; summary: string; content: string[]; links: ArticleLink[]; tags: string[] }> = {
    en: {
      title: asString(article?.translations?.en?.title ?? article?.title ?? sourceTitle),
      summary: asString(article?.translations?.en?.summary ?? article?.summary ?? sourceSummary),
      content: Array.isArray(article?.translations?.en?.content)
        ? article.translations.en.content.map((item: unknown) => asString(item))
        : sourceContent,
      links: normalizeLinks(article?.translations?.en?.links ?? article?.links ?? sourceLinks),
      tags: normalizeTags(article?.translations?.en?.tags ?? article?.tags ?? sourceTags),
    },
    pl: {
      title: asString(article?.translations?.pl?.title ?? article?.title ?? sourceTitle),
      summary: asString(article?.translations?.pl?.summary ?? article?.summary ?? sourceSummary),
      content: Array.isArray(article?.translations?.pl?.content)
        ? article.translations.pl.content.map((item: unknown) => asString(item))
        : sourceContent,
      links: normalizeLinks(article?.translations?.pl?.links ?? article?.links ?? sourceLinks),
      tags: normalizeTags(article?.translations?.pl?.tags ?? article?.tags ?? sourceTags),
    },
  };

  return {
    slug: asString(article?.slug),
    category: asString(article?.category),
    title: sourceTitle,
    summary: sourceSummary,
    content: sourceContent,
    links: sourceLinks,
    tags: sourceTags,
    translations: article?.translations ? normalizedTranslations : undefined,
  };
}

export function normalizeCategoryList(categories: CategoryLike[], locale: Locale): LocalizedCategory[] {
  return categories.map((category) => normalizeCategory(category, locale));
}

export function normalizeArticleList(articles: ArticleLike[], locale: Locale): LocalizedArticle[] {
  return articles.map((article) => normalizeArticle(article, locale));
}

export function getRelatedArticles(current: LocalizedArticle, articles: LocalizedArticle[], limit = 3): LocalizedArticle[] {
  const currentTags = new Set(current.tags.map((tag) => tag.toLowerCase()));

  return [...articles]
    .filter((article) => article.slug !== current.slug)
    .map((article) => {
      const sharedTags = article.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
      const sameCategory = article.category === current.category ? 3 : 0;
      const score = sharedTags * 4 + sameCategory;
      return { article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}
