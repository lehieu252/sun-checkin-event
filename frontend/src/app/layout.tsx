import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Google_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { localFontVariables } from '@/lib/fonts';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const googleSans = Google_Sans({
  variable: '--font-google-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Plug in to evolution',
  description: 'Plug in to evolution',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Plug in to evolution',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffa724',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${googleSans.variable} ${localFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
