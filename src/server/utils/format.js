export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function formatPrice(amount) {
  return `${new Intl.NumberFormat('ru-RU').format(amount).replace(/\s/g, ' ')} so‘m`;
}
