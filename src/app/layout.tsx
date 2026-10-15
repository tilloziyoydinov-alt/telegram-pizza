import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { TelegramProvider } from '@/providers/TelegramProvider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pizza — buyurtma',
  description: 'Telegram Mini App orqali pitsa buyurtma qilish',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body>
        {/* Telegram WebApp SDK — ilova ishga tushishidan oldin yuklanishi kerak */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
