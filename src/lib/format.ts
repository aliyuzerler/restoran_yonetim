export const CURRENCY = "₺";

export function formatPrice(value: number, currency = "₺"): string {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${currency}${formatted}`;
}

export function formatDate(iso: string): string {
  // iso is yyyy-mm-dd
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatTime(time: string): string {
  return time;
}

export function relativeDay(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);
  if (iso === today) return "Bugün";
  if (iso === tomorrow) return "Yarın";
  return formatShortDate(iso);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}
