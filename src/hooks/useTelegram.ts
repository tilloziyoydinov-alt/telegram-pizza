'use client';

import { useContext, useEffect, useRef } from 'react';
import { TelegramContext } from '@/providers/TelegramProvider';

/** window.Telegram.WebApp'ning biz ishlatadigan qismi */
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string } };
  colorScheme: 'light' | 'dark';
  platform: string;
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string, callback?: () => void): void;
  MainButton: {
    setText(text: string): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function useTelegram() {
  return useContext(TelegramContext);
}

/** Telegram'ning pastki asosiy tugmasi (MainButton). Telegram tashqarisida hech narsa qilmaydi. */
export function useMainButton(options: { text: string; visible: boolean; loading?: boolean; onClick: () => void }) {
  const { webApp } = useTelegram();
  const handlerRef = useRef(options.onClick);
  handlerRef.current = options.onClick;

  useEffect(() => {
    if (!webApp) return;
    const handler = () => handlerRef.current();
    webApp.MainButton.onClick(handler);
    return () => {
      webApp.MainButton.offClick(handler);
      webApp.MainButton.hide();
    };
  }, [webApp]);

  useEffect(() => {
    if (!webApp) return;
    const btn = webApp.MainButton;
    btn.setText(options.text);
    if (options.visible) btn.show();
    else btn.hide();
    if (options.loading) {
      btn.showProgress(false);
      btn.disable();
    } else {
      btn.hideProgress();
      btn.enable();
    }
  }, [webApp, options.text, options.visible, options.loading]);
}

/** Telegram'ning "orqaga" tugmasi (modal yopish uchun) */
export function useBackButton(visible: boolean, onClick: () => void) {
  const { webApp } = useTelegram();
  const handlerRef = useRef(onClick);
  handlerRef.current = onClick;

  useEffect(() => {
    if (!webApp || !visible) return;
    const handler = () => handlerRef.current();
    webApp.BackButton.onClick(handler);
    webApp.BackButton.show();
    return () => {
      webApp.BackButton.offClick(handler);
      webApp.BackButton.hide();
    };
  }, [webApp, visible]);
}
