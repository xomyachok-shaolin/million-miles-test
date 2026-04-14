"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRates, fetchStats } from "@/lib/api";
import { fmtJpy, fmtRub } from "@/lib/format";
import { useAuth } from "@/store/auth";

export default function StatsBar() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(token!),
    enabled: !!token,
    staleTime: 60_000,
  });
  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: fetchRates,
    staleTime: 60 * 60_000,
  });

  if (!data) return null;

  const lastAgo = data.last_updated_at
    ? timeAgo(new Date(data.last_updated_at))
    : "—";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10l1.5-4.5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 10M3 10v6a1 1 0 001 1h1a2 2 0 100-4m16-3v6a1 1 0 01-1 1h-1a2 2 0 11-4 0H9"/></svg>}
        label="Авто всего"
        value={data.total.toLocaleString("ru-RU")}
        accent="indigo"
      />
      <Card
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        label="Новых за 24ч"
        value={data.new_24h.toString()}
        accent="emerald"
      />
      <Card
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 9v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        label="Средняя цена"
        value={fmtJpy(data.avg_price_jpy)}
        sub={fmtRub(data.avg_price_jpy, rates?.JPY_to_RUB) || undefined}
        accent="violet"
      />
      <Card
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>}
        label="Марок"
        value={data.makes_count.toString()}
        accent="amber"
      />
      <Card
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
        label="Обновлено"
        value={lastAgo}
        sub={rates?.JPY_to_RUB ? `1 ¥ = ${rates.JPY_to_RUB.toFixed(2)} ₽` : undefined}
        accent="sky"
      />
    </div>
  );
}

const ACCENT: Record<string, string> = {
  indigo: "from-indigo-50 to-indigo-100 text-indigo-700",
  emerald: "from-emerald-50 to-emerald-100 text-emerald-700",
  violet: "from-violet-50 to-violet-100 text-violet-700",
  amber: "from-amber-50 to-amber-100 text-amber-700",
  sky: "from-sky-50 to-sky-100 text-sky-700",
};

function Card({ icon, label, value, sub, accent = "indigo" }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br p-2 ${ACCENT[accent]}`}>
        {icon}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 truncate text-lg font-bold text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 truncate text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}с назад`;
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  return `${Math.floor(s / 86400)} д назад`;
}
