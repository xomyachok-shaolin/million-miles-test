"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCars, fetchFilters } from "@/lib/api";
import { useAuth } from "@/store/auth";
import CarCard from "@/components/CarCard";
import FiltersPanel, { EMPTY_FILTERS, type FiltersState } from "@/components/Filters";
import StatsBar from "@/components/StatsBar";

export default function CarsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const params = {
    q: filters.q || undefined,
    make: filters.make || undefined,
    body_type: filters.body_type || undefined,
    transmission: filters.transmission || undefined,
    fuel: filters.fuel || undefined,
    year_from: filters.year_from || undefined,
    year_to: filters.year_to || undefined,
    price_from: filters.price_from || undefined,
    price_to: filters.price_to || undefined,
    mileage_to: filters.mileage_to || undefined,
    sort: filters.sort,
    order: filters.order,
    page,
    page_size: 24,
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["cars", params],
    queryFn: () => fetchCars(token!, params),
    enabled: !!token,
    placeholderData: (prev) => prev,
  });

  const { data: options } = useQuery({
    queryKey: ["filters"],
    queryFn: () => fetchFilters(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Каталог автомобилей</h1>
        <p className="mt-1 text-sm text-slate-500">
          Данные обновляются автоматически раз в час из CarSensor.net
        </p>
      </div>

      <div className="mb-5">
        <StatsBar />
      </div>

      <div className="mb-6">
        <FiltersPanel
          state={filters}
          onChange={setFilters}
          options={options}
          total={data?.total}
        />
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
      <p className="mt-4 text-sm font-medium text-slate-600">Ничего не найдено</p>
      <p className="text-xs text-slate-400">Попробуйте ослабить фильтры</p>
    </div>
  );
}
