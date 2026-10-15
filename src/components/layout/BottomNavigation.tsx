'use client';

import { cn } from '@/lib/utils';

export type Tab = 'menu' | 'cart' | 'orders';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'menu', label: 'Menyu', icon: '🍕' },
  { id: 'cart', label: 'Savat', icon: '🛒' },
  { id: 'orders', label: 'Buyurtmalar', icon: '📦' },
];

export function BottomNavigation({ active, onChange, cartCount }: { active: Tab; onChange: (t: Tab) => void; cartCount: number }) {
  return (
    <nav className="bottom-nav" aria-label="Asosiy navigatsiya">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={cn('nav-item', active === t.id && 'nav-item-active')}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          <span className="nav-icon">
            {t.icon}
            {t.id === 'cart' && cartCount > 0 && <span className="badge">{cartCount}</span>}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
