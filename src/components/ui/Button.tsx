import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, block, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn-${variant}`, `btn-${size}`, block && 'btn-block', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden /> : children}
    </button>
  );
}
