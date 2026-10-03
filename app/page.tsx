import { cookies } from 'next/headers';
import { HomePageClient } from '@/components/home-page-client';
import { getFeaturedArticles, getLocations } from '@/lib/data';
import { getLocaleFromCookies } from '@/lib/i18n';

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookies(cookieStore);
  const articles = getFeaturedArticles(3, locale);
  const locationCount = getLocations().length;

  return <HomePageClient articles={articles} locationCount={locationCount} />;
}
