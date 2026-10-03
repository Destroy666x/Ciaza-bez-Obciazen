import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="card mobile-card rounded-[2rem] p-8">
        <div className="text-5xl">🤍</div>
        <h1 className="mt-4 text-3xl font-black text-[var(--brand-strong)]">Strona nie istnieje</h1>
        <p className="mt-3 text-[var(--muted)]">Ta część prototypu nie została jeszcze dodana lub wróciła do prac przygotowawczych.</p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-[var(--brand-strong)] px-5 py-3 font-semibold text-white">
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
}
