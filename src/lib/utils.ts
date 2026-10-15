export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(amount).replace(/\s/g, ' ')} so‘m`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** "90 123 45 67" -> "+998901234567" */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
  return input.trim();
}

export const isValidUzPhone = (phone: string) => /^\+998\d{9}$/.test(phone);

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
