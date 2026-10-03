import Link from 'next/link';
import { cookies } from 'next/headers';
import { getArticles, getCategories } from '@/lib/data';
import { getDictionary, getLocaleFromCookies } from '@/lib/i18n';

export default async function KnowledgeCenterPage() {
  const locale = getLocaleFromCookies(await cookies());
  const dictionary = getDictionary(locale);
  const categories = getCategories(locale).filter((category) => !category.parent && category.slug !== 'faq');
  const faqArticle = getArticles(locale).find((article) => article.slug === 'faq' || article.category === 'faq');

  return (
    <div className="space-y-6">
      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl">📚</div>
          <div>
            <h1 className="text-3xl font-black text-[var(--brand-strong)]">{dictionary.knowledge.title}</h1>
            <p className="text-sm text-[var(--muted)]">{dictionary.knowledge.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.slug} href={`/knowledge-base/${category.slug}`} className="card mobile-card block rounded-[1.5rem] p-4 transition hover:-translate-y-0.5">
            <div className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">{category.kind}</div>
            <h2 className="mt-2 text-xl font-bold text-[var(--brand-strong)]">{category.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{category.description}</p>
          </Link>
        ))}
      </section>

      {faqArticle && (
        <section className="card mobile-card rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">FAQ</div>
              <h2 className="mt-2 text-2xl font-black text-[var(--brand-strong)]">{faqArticle.title}</h2>
            </div>
            <Link href={`/knowledge-base/${faqArticle.slug}`} className="rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white">
              {dictionary.knowledge.read}
            </Link>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">{faqArticle.summary}</p>
        </section>
      )}
    </div>
  );
}
