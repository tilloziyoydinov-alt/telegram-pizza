'use client';

import { useEffect, type ReactNode } from 'react';
import { useBackButton } from '@/hooks/useTelegram';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Pastdan chiquvchi oyna (bottom sheet). Telegram'ning BackButton'i ham yopadi. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  useBackButton(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Yopish">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
