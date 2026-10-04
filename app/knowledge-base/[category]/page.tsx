import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getArticles, getCategories } from '@/lib/data';
import { getDictionary, getLocaleFromCookies } from '@/lib/i18n';

export function generateStaticParams() {
  return getCategories().filter((category) => !category.parent).map((category) => ({ category: category.slug }));
}

export default async function KnowledgeCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const locale = getLocaleFromCookies(await cookies());
  const dictionary = getDictionary(locale);
  const category = getCategories(locale).find((entry) => entry.slug === resolvedParams.category);

  if (!category) {
    notFound();
  }

  const categoryMap = new Map(
    getCategories(locale).map((entry) => [entry.slug, entry])
  );

  const childCategories = getCategories(locale).filter((entry) => entry.parent === category.slug);
  const articles = getArticles(locale).filter((article) => article.category === category.slug || article.category.startsWith(`${category.slug}/`));

  const primaryCategories = getCategories(locale).filter((entry) => !entry.parent && entry.slug !== 'faq');

  return (
    <div className="space-y-6">
      <section className="card mobile-card rounded-[1.5rem] p-3">
        <div className="flex flex-wrap gap-2">
          {primaryCategories.map((primaryCategory) => (
            <Link
              key={primaryCategory.slug}
              href={`/knowledge-base/${primaryCategory.slug}`}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                primaryCategory.slug === category.slug
                  ? 'bg-[var(--brand-strong)] text-white'
                  : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--brand-strong)]'
              }`}
            >
              {primaryCategory.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{category.kind}</div>
            <h1 className="mt-2 text-3xl font-black text-[var(--brand-strong)]">{category.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{category.description}</p>
          </div>
          <Link href="/knowledge-base" className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)]">
            {dictionary.common.back}
          </Link>
        </div>
      </section>

      {childCategories.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {childCategories.map((childCategory) => (
            <Link key={childCategory.slug} href={`/knowledge-base/${childCategory.slug}`} className="card mobile-card block rounded-[1.5rem] p-4 transition hover:-translate-y-0.5">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{childCategory.kind}</div>
              <h2 className="mt-2 text-xl font-bold text-[var(--brand-strong)]">{childCategory.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{childCategory.description}</p>
            </Link>
          ))}
        </section>
      )}

      <section className="grid gap-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link key={article.slug} href={`/knowledge-base/${article.slug}`} className="card mobile-card block rounded-[1.5rem] p-5 transition hover:-translate-y-0.5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{categoryMap.get(article.category)?.title ?? category.title}</div>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--brand-strong)]">{article.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">{article.summary}</p>
                </div>
                <div className="rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand)]">
                  {dictionary.knowledge.read}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card mobile-card rounded-[1.5rem] p-5 text-sm text-[var(--muted)]">
            {dictionary.knowledge.categories}
          </div>
        )}
      </section>
    </div>
  );
}
