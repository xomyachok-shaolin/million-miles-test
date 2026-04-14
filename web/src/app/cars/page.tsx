"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCars } from "@/lib/api";
import { useAuth } from "@/store/auth";
import CarCard from "@/components/CarCard";

export default function CarsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [make, setMake] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [sort, setSort] = useState("updated");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const params = {
    q: q || undefined,
    make: make || undefined,
    year_from: yearFrom || undefined,
    price_to: priceTo || undefined,
    sort,
    order,
    page,
    page_size: 24,
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["cars", params],
    queryFn: () => fetchCars(token!, params),
    enabled: !!token,
    placeholderData: (prev) => prev,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Каталог автомобилей</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data ? (
            <>Найдено <span className="font-semibold text-slate-700">{data.total}</span> предложений</>
          ) : (
            "Загрузка…"
          )}
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Input placeholder="Поиск" value={q} onChange={setQ} icon="search" />
          <Input placeholder="Марка" value={make} onChange={setMake} />
          <Input placeholder="Год от" value={yearFrom} onChange={setYearFrom} type="number" />
          <Input placeholder="Цена до, ¥" value={priceTo} onChange={setPriceTo} type="number" />
          <Select value={sort} onChange={setSort} options={[
            ["updated", "По обновлению"],
            ["price", "По цене"],
            ["year", "По году"],
            ["mileage", "По пробегу"],
          ]} />
          <Select value={order} onChange={(v) => setOrder(v as "asc" | "desc")} options={[
            ["desc", "По убыв."],
            ["asc", "По возр."],
          ]} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Ошибка загрузки данных
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : data?.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isFetching ? "opacity-60" : ""}`}>
          {data?.items.map((c) => <CarCard key={c.id} car={c} />)}
        </div>
      )}

      {data && data.pages > 1 && (
        <Pagination page={data.page} pages={data.pages} onChange={setPage} />
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", icon }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  icon?: "search";
}) {
  return (
    <div className="relative">
      {icon === "search" && (
        <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${icon ? "pl-8" : ""}`}
      />
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
      >
        ← Назад
      </button>
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
        {page} / {pages}
      </span>
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
      >
        Вперёд →
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-[16/10] animate-pulse bg-slate-100" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 10l1.5-4.5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 10m-18 0h18m-18 0v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M7 17h10" />
      </svg>
      <p className="mt-4 text-sm font-medium text-slate-600">Пока нет автомобилей</p>
      <p className="text-xs text-slate-400">Воркер скоро пришлёт первые данные</p>
    </div>
  );
}
