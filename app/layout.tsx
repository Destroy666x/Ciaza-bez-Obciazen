import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'Ciąża bez Obciążeń',
  description: 'Supportive pregnancy guides and services for moms-to-be in Poland.',
  applicationName: 'Ciąża bez Obciążeń',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', rel: 'icon' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#f6dfe7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
