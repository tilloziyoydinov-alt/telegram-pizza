'use client';

import { useTelegram } from '@/hooks/useTelegram';

export function Header() {
  const { user } = useTelegram();
  return (
    <header className="header">
      <div>
        <h1>🍕 Pizza</h1>
        <p className="muted">{user ? `Salom, ${user.first_name}!` : 'Eng mazali pitsalar'}</p>
      </div>
    </header>
  );
}
