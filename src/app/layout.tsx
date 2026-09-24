import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import InitialLoader from '@/components/InitialLoader';

const integralCF = localFont({
  src: '../../public/Integral CF Regular.woff',
  variable: '--font-integral',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ABOVA | Above All',
  description: 'Three foundations. Endless combinations.',
  metadataBase: new URL('https://theabova.com'),
  openGraph: {
    title: 'ABOVA | Above All',
    description: 'Three foundations. Endless combinations.',
    url: 'https://theabova.com',
    siteName: 'ABOVA',
    images: [
      {
        url: '/abova-logo.png',
        width: 800,
        height: 800,
        alt: 'ABOVA | Above All',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABOVA | Above All',
    description: 'Three foundations. Endless combinations.',
    images: ['/abova-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={integralCF.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --font-serif: var(--font-integral), 'Montserrat', sans-serif;
          }
        `}} />
      </head>
      <body>
        <InitialLoader />
        {children}
      </body>
    </html>
  );
}
