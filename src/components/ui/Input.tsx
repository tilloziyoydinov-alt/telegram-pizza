import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ label, error, className, ...rest }, ref) {
    const id = useId();
    return (
      <label className="field" htmlFor={id}>
        <span className="field-label">{label}</span>
        <input id={id} ref={ref} className={cn('input', error && 'input-error', className)} aria-invalid={!!error} {...rest} />
        {error && <span className="field-error">{error}</span>}
      </label>
    );
  },
);

export function Textarea({ label, error, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <textarea id={id} className={cn('input', error && 'input-error', className)} rows={2} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
