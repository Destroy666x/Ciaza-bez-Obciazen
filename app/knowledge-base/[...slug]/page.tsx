import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles, getCategories } from '@/lib/data';
import { getDictionary, getLocaleFromCookies } from '@/lib/i18n';

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug.split('/') }));
}

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') ?? '';
  const locale = getLocaleFromCookies(await cookies());
  const dictionary = getDictionary(locale);
  const article = getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  const primaryCategories = getCategories(locale).filter((category) => !category.parent && category.slug !== 'faq');
  const articleCategory = getCategories(locale).find((category) => category.slug === article.category);
  const categoryBackHref = article.category.includes('/') ? `/knowledge-base/${article.category}` : '/knowledge-base';
  const categoryBackLabel = articleCategory?.title ?? (locale === 'pl' ? 'Powrót do kategorii' : 'Back to category');
  const relatedArticles = getArticles(locale)
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => article.tags.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase())).length;
      const sameCategory = candidate.category === article.category ? 3 : 0;
      return { candidate, score: sharedTags * 4 + sameCategory };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <section className="card mobile-card rounded-[1.5rem] p-3">
        <div className="flex flex-wrap gap-2">
          {primaryCategories.map((categoryOption) => (
            <Link
              key={categoryOption.slug}
              href={`/knowledge-base/${categoryOption.slug}`}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                article.category.startsWith(`${categoryOption.slug}/`) || categoryOption.slug === article.category
                  ? 'bg-[var(--brand-strong)] text-white'
                  : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--brand-strong)]'
              }`}
            >
              {categoryOption.title}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/knowledge-base" className="inline-flex rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--brand-strong)]">
          {dictionary.common.back === 'Wstecz' ? '← Powrót do centrum wiedzy' : '← Back to knowledge base'}
        </Link>
        {articleCategory && (
          <Link href={categoryBackHref} className="inline-flex rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--brand-strong)]">
            {locale === 'pl' ? '← Powrót do' : '← Back to'} {categoryBackLabel}
          </Link>
        )}
      </div>

      <header className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{articleCategory?.title ?? article.category}</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--brand-strong)] md:text-5xl">{article.title}</h1>
        <p className="mt-3 text-lg text-[var(--muted)]">{article.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-strong)]">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="article-content space-y-4">
          {article.content.map((paragraph, index) => (
            <div
              key={`${article.slug}-${index}`}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>
      </section>

      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <h2 className="text-2xl font-black text-[var(--brand-strong)]">{locale === 'pl' ? 'Dodatkowe źródła' : 'Additional resources'}</h2>
        <ul className="mt-4 space-y-3">
          {article.links.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noreferrer" className="text-base font-medium text-[var(--brand)]">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {relatedArticles.length > 0 && (
        <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
          <h2 className="text-2xl font-black text-[var(--brand-strong)]">{locale === 'pl' ? 'Powiązane artykuły' : 'Related articles'}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.slug} href={`/knowledge-base/${relatedArticle.slug}`} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{relatedArticle.category}</div>
                <h3 className="mt-2 text-lg font-bold text-[var(--brand-strong)]">{relatedArticle.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{relatedArticle.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
