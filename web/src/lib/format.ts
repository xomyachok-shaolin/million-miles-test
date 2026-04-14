export function fmtJpy(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 10_000_000) return `¥${(v / 10_000_000).toFixed(1)}千万`;
  if (v >= 10_000) return `¥${(v / 10_000).toFixed(0)}万`;
  return `¥${v.toLocaleString("ja-JP")}`;
}

export function fmtRub(jpy: number | null | undefined, rate: number | null | undefined): string | null {
  if (jpy == null || !rate) return null;
  const rub = Math.round(jpy * rate);
  if (rub >= 1_000_000) return `₽${(rub / 1_000_000).toFixed(1)} млн`;
  if (rub >= 1_000) return `₽${(rub / 1_000).toFixed(0)} тыс`;
  return `₽${rub.toLocaleString("ru-RU")}`;
}

export function fmtRubFull(jpy: number | null | undefined, rate: number | null | undefined): string | null {
  if (jpy == null || !rate) return null;
  const rub = Math.round(jpy * rate);
  return `≈ ₽${rub.toLocaleString("ru-RU")}`;
}

export function fmtMileage(km: number | null | undefined): string | null {
  if (km == null) return null;
  if (km >= 10_000) return `${(km / 10_000).toFixed(1)}万km`;
  return `${km.toLocaleString()} km`;
}

export function isNew(updatedAt: string | null | undefined, created: string | null | undefined = null): boolean {
  const t = created || updatedAt;
  if (!t) return false;
  return Date.now() - new Date(t).getTime() < 24 * 3600 * 1000;
}
