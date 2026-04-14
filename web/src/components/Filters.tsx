"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Filters } from "@/lib/api";

export type FiltersState = {
  q: string;
  make: string;
  body_type: string;
  transmission: string;
  fuel: string;
  year_from: string;
  year_to: string;
  price_from: string;
  price_to: string;
  mileage_to: string;
  sort: string;
  order: "asc" | "desc";
};

export const EMPTY_FILTERS: FiltersState = {
  q: "",
  make: "",
  body_type: "",
  transmission: "",
  fuel: "",
  year_from: "",
  year_to: "",
  price_from: "",
  price_to: "",
  mileage_to: "",
  sort: "updated",
  order: "desc",
};

export default function FiltersPanel({
  state,
  onChange,
  options,
  total,
}: {
  state: FiltersState;
  onChange: (s: FiltersState) => void;
  options?: Filters;
  total?: number;
}) {
  const [local, setLocal] = useState(state);
  const [open, setOpen] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setLocal(state), [state]);

  const push = (next: FiltersState) => {
    setLocal(next);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => onChange(next), 300);
  };

  const set = <K extends keyof FiltersState>(k: K, v: FiltersState[K]) => push({ ...local, [k]: v });

  const reset = () => {
    setLocal(EMPTY_FILTERS);
    onChange(EMPTY_FILTERS);
  };

  const activeChips = useMemo(() => {
    const chips: { key: keyof FiltersState; label: string }[] = [];
    if (local.make) chips.push({ key: "make", label: `Марка: ${local.make}` });
    if (local.body_type) chips.push({ key: "body_type", label: `Кузов: ${local.body_type}` });
    if (local.transmission) chips.push({ key: "transmission", label: `КПП: ${local.transmission}` });
    if (local.fuel) chips.push({ key: "fuel", label: `Топливо: ${local.fuel}` });
    if (local.year_from) chips.push({ key: "year_from", label: `Год от ${local.year_from}` });
    if (local.year_to) chips.push({ key: "year_to", label: `Год до ${local.year_to}` });
    if (local.price_from) chips.push({ key: "price_from", label: `Цена от ¥${fmtCompact(+local.price_from)}` });
    if (local.price_to) chips.push({ key: "price_to", label: `Цена до ¥${fmtCompact(+local.price_to)}` });
    if (local.mileage_to) chips.push({ key: "mileage_to", label: `Пробег до ${fmtKm(+local.mileage_to)}` });
    return chips;
  }, [local]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={local.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Поиск: Toyota, Supra, グレード…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          onClick={() => setOpen((x) => !x)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Фильтры
          {activeChips.length > 0 && (
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              {activeChips.length}
            </span>
          )}
        </button>
        <div className="hidden items-center gap-2 md:flex">
          <select
            value={local.sort}
            onChange={(e) => set("sort", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="updated">По обновлению</option>
            <option value="price">По цене</option>
            <option value="year">По году</option>
            <option value="mileage">По пробегу</option>
          </select>
          <button
            onClick={() => set("order", local.order === "asc" ? "desc" : "asc")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:bg-slate-50"
            title={local.order === "asc" ? "По возрастанию" : "По убыванию"}
          >
            {local.order === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2">
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={() => set(c.key, "" as FiltersState[typeof c.key])}
              className="group flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              {c.label}
              <svg className="h-3 w-3 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button onClick={reset} className="ml-1 text-xs text-slate-500 hover:text-slate-700">
            Сбросить
          </button>
        </div>
      )}

      {open && (
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-4 sm:grid-cols-3 lg:grid-cols-4">
          <Select label="Марка" value={local.make} onChange={(v) => set("make", v)} options={options?.makes || []} />
          <Select label="Кузов" value={local.body_type} onChange={(v) => set("body_type", v)} options={options?.body_types || []} />
          <Select label="КПП" value={local.transmission} onChange={(v) => set("transmission", v)} options={options?.transmissions || []} />
          <Select label="Топливо" value={local.fuel} onChange={(v) => set("fuel", v)} options={options?.fuels || []} />

          <RangePair
            label="Год"
            from={local.year_from}
            to={local.year_to}
            min={options?.year.min ?? undefined}
            max={options?.year.max ?? undefined}
            onFromChange={(v) => set("year_from", v)}
            onToChange={(v) => set("year_to", v)}
          />
          <RangePair
            label="Цена ¥"
            from={local.price_from}
            to={local.price_to}
            placeholderFrom="от"
            placeholderTo="до"
            onFromChange={(v) => set("price_from", v)}
            onToChange={(v) => set("price_to", v)}
          />
          <NumberInput
            label="Пробег до, км"
            value={local.mileage_to}
            onChange={(v) => set("mileage_to", v)}
            placeholder="100000"
          />

          <div className="flex items-end gap-2 md:hidden">
            <select
              value={local.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="updated">Сорт: обновлено</option>
              <option value="price">Сорт: цена</option>
              <option value="year">Сорт: год</option>
              <option value="mileage">Сорт: пробег</option>
            </select>
            <button
              onClick={() => set("order", local.order === "asc" ? "desc" : "asc")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {local.order === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
        <div>
          {total != null && (
            <>Найдено <span className="font-semibold text-slate-700">{total.toLocaleString("ru-RU")}</span> авто</>
          )}
        </div>
        {activeChips.length > 0 && (
          <button onClick={reset} className="font-medium text-indigo-600 hover:text-indigo-800">
            Сбросить всё
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value="">Любой</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || Number(v) >= min) onChange(v);
        }}
        onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function RangePair({
  label,
  from,
  to,
  onFromChange,
  onToChange,
  placeholderFrom = "от",
  placeholderTo = "до",
  min,
  max,
}: {
  label: string;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  placeholderFrom?: string;
  placeholderTo?: string;
  min?: number;
  max?: number;
}) {
  const lo = min ?? 0;
  const sanitize = (v: string) => (v === "" || Number(v) >= lo ? v : "");
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          min={lo}
          max={max}
          value={from}
          onChange={(e) => onFromChange(sanitize(e.target.value))}
          onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
          placeholder={min != null ? `от ${min}` : placeholderFrom}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span className="text-xs text-slate-400">—</span>
        <input
          type="number"
          inputMode="numeric"
          min={lo}
          max={max}
          value={to}
          onChange={(e) => onToChange(sanitize(e.target.value))}
          onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
          placeholder={max != null ? `до ${max}` : placeholderTo}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );
}

function fmtCompact(v: number) {
  if (v >= 10_000_000) return `${(v / 10_000_000).toFixed(1)}千万`;
  if (v >= 10_000) return `${(v / 10_000).toFixed(0)}万`;
  return v.toLocaleString("ja-JP");
}

function fmtKm(v: number) {
  if (v >= 10_000) return `${(v / 10_000).toFixed(0)}万km`;
  return `${v.toLocaleString()} km`;
}
