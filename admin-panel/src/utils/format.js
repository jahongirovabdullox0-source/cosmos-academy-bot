export function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
