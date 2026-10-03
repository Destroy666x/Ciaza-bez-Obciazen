'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/client-i18n';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { locale, setLocale, t } = useLocale();

  const tabs = [
    { href: '/knowledge-base', label: t.tabs.knowledge, icon: '📚' },
    { href: '/map', label: t.tabs.map, icon: '📍' },
    { href: '/pregnancy-timeline', label: t.tabs.timeline, icon: '🗓️' },
    { href: '/contact', label: t.tabs.contact, icon: '💬' },
  ];

  const accountTabs = [
    { href: '/account/settings', label: t.tabs.settings, icon: '⚙️' },
    { href: '/account/favorite-places', label: t.tabs.favorites, icon: '♥' },
  ];

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const mediaDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = stored === 'dark' || stored === 'light' ? stored : mediaDark ? 'dark' : 'light';
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(248,245,242,0.92)] backdrop-blur-xl dark:bg-[rgba(20,18,27,0.8)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f7d773,#f6dfe7)] shadow-soft">
              <Image src="/logo-192.png" alt="Ciąża bez Obciążeń" width={44} height={44} className="h-full w-full object-cover" priority />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[var(--brand-strong)]">{t.appName}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">{t.supportEveryWeek}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`nav-pill flex items-center gap-2 px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith(tab.href)
                    ? 'border-[var(--brand)] bg-[var(--accent)] text-[var(--brand-strong)]'
                    : ''
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            ))}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className={`nav-pill flex items-center gap-2 px-3 py-2 text-sm font-medium transition ${
                    pathname.startsWith('/account/')
                      ? 'border-[var(--brand)] bg-[var(--accent)] text-[var(--brand-strong)]'
                      : ''
                  }`}
                >
                  <span>👤</span>
                  <span>Account</span>
                  <span className="text-xs">▼</span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-48 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 shadow-lg"
                >
                  {accountTabs.map((tab) => (
                    <DropdownMenu.Item key={tab.href} asChild>
                      <Link
                        href={tab.href}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none ${
                          pathname.startsWith(tab.href)
                            ? 'bg-[var(--accent)] text-[var(--brand-strong)]'
                            : 'text-[var(--ink)] hover:bg-[var(--accent)]'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-lg"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')}
              className="hidden rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium md:inline-flex"
            >
              {locale === 'en' ? 'PL' : 'EN'}
            </button>
            <Link href="/account/login" className="hidden rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium md:inline-flex">
              {t.actions.login}
            </Link>
            <Link href="/account/register" className="rounded-full bg-[var(--brand-strong)] px-3 py-2 text-sm font-semibold text-white shadow-soft">
              {t.actions.register}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-6 gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium ${
                pathname.startsWith(tab.href) ? 'bg-[var(--accent)] text-[var(--brand-strong)]' : 'text-[var(--muted)]'
              }`}
            >
              <span className="mb-1 text-lg">{tab.icon}</span>
              <span>{tab.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
