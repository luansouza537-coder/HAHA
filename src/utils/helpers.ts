export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const safeDays = isNaN(days) || typeof days !== 'number' ? 1 : days;
  const d = new Date((dateStr || getTodayDate()) + 'T00:00:00');
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + safeDays);
    return fallback.toISOString().split('T')[0];
  }
  d.setDate(d.getDate() + safeDays);
  return d.toISOString().split('T')[0];
}

export function generateUniqueNumericId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export function generateUniqueStringId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (_e) {
      // fall through
    }
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 11);
}
