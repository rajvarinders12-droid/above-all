import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const integralCF = localFont({
  src: '../../public/Integral CF Regular.woff',
  variable: '--font-integral',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ABOVA | Above All',
  description: 'Three foundations. Endless combinations.',
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
        {children}
      </body>
    </html>
  );
}
