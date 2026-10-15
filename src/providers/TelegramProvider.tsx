'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { TelegramWebApp } from '@/hooks/useTelegram';
import { useCartStore } from '@/store/cartStore';

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  user: TelegramWebApp['initDataUnsafe']['user'] | null;
  /** Imzolangan initData — backend'ga avtorizatsiya uchun yuboriladi */
  initData: string;
  isReady: boolean;
  /** Ilova Telegram ichida ochilganmi */
  isTelegram: boolean;
  haptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  initData: '',
  isReady: false,
  isTelegram: false,
  haptic: () => {},
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<TelegramContextValue>(() => ({
    webApp: null,
    user: null,
    initData: '',
    isReady: false,
    isTelegram: false,
    haptic: () => {},
  }));

  useEffect(() => {
    // Savat localStorage'dan faqat klientda tiklanadi (SSR hydration mos kelishi uchun)
    void useCartStore.persist.rehydrate();

    const webApp = window.Telegram?.WebApp;
    const isTelegram = Boolean(webApp?.initData);
    if (webApp && isTelegram) {
      webApp.ready();
      webApp.expand();
    }
    setValue({
      webApp: isTelegram ? webApp! : null,
      user: webApp?.initDataUnsafe.user ?? null,
      initData: webApp?.initData ?? '',
      isReady: true,
      isTelegram,
      haptic: (style = 'light') => {
        try {
          webApp?.HapticFeedback.impactOccurred(style);
        } catch {
          /* eski klientlarda qo'llab-quvvatlanmaydi */
        }
      },
    });
  }, []);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
