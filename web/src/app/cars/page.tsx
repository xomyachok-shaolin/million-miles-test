"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCars } from "@/lib/api";
import { useAuth } from "@/store/auth";

function fmtPrice(v: number | null) {
  if (v == null) return "—";
  return `¥${v.toLocaleString("ja-JP")}`;
}

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
    page_size: 20,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["cars", params],
    queryFn: () => fetchCars(token!, params),
    enabled: !!token,
  });

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} className="rounded border px-2 py-1" />
        <input placeholder="Марка (Toyota)" value={make} onChange={(e) => setMake(e.target.value)} className="rounded border px-2 py-1" />
        <input placeholder="Год от" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className="rounded border px-2 py-1" />
        <input placeholder="Цена до (JPY)" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="rounded border px-2 py-1" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded border px-2 py-1">
          <option value="updated">Обновлено</option>
          <option value="price">Цена</option>
          <option value="year">Год</option>
          <option value="mileage">Пробег</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")} className="rounded border px-2 py-1">
          <option value="desc">↓</option>
          <option value="asc">↑</option>
        </select>
      </div>

      {isLoading && <div>Загрузка…</div>}
      {error && <div className="text-red-600">Ошибка загрузки</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            href={`/cars/${c.id}`}
            className="overflow-hidden rounded border bg-white transition hover:shadow"
          >
            <div className="aspect-video bg-neutral-100">
              {c.primary_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.primary_image} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="p-3">
              <div className="font-medium">
                {c.make || "—"} {c.model || ""}
              </div>
              <div className="text-sm text-neutral-600">
                {c.year || "—"} · {c.mileage_km ? `${c.mileage_km.toLocaleString()} км` : "—"}
              </div>
              <div className="mt-1 font-semibold">{fmtPrice(c.price_jpy)}</div>
              {c.location && <div className="mt-1 text-xs text-neutral-500">{c.location}</div>}
            </div>
          </Link>
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1 disabled:opacity-50">
            ←
          </button>
          <span className="text-sm">
            Стр. {data.page} / {data.pages} · всего {data.total}
          </span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1 disabled:opacity-50">
            →
          </button>
        </div>
      )}
    </div>
  );
}
