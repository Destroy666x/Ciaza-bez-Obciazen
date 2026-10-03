'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/client-i18n';

export default function RegisterPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="card mobile-card rounded-[2rem] p-5 md:p-6">
        <h1 className="text-3xl font-black text-[var(--brand-strong)]">{t.auth.registerTitle}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t.auth.registerSubtitle}</p>
      </section>

      <form className="card mobile-card rounded-[1.6rem] p-5">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{t.auth.firstName}</span>
            <input type="text" placeholder={t.auth.firstNamePlaceholder} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{t.auth.email}</span>
            <input type="email" placeholder={t.auth.emailPlaceholder} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--muted)]">{t.auth.password}</span>
            <input type="password" placeholder={t.auth.passwordHint} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 outline-none" />
          </label>
        </div>

        <button type="submit" className="mt-5 w-full rounded-full bg-[var(--brand-strong)] px-4 py-3 font-semibold text-white">
          {t.auth.createAccountButton}
        </button>

        <div className="mt-4 text-center text-sm text-[var(--muted)]">
          {t.auth.alreadyHaveAccount} <Link href="/login" className="font-semibold text-[var(--brand)]">{t.auth.loginButton}</Link>
        </div>
      </form>
    </div>
  );
}
