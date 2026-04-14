"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCar } from "@/lib/api";
import { useAuth } from "@/store/auth";

function fmtPrice(v: number | null | undefined) {
  if (v == null) return "—";
  if (v >= 10_000_000) return `¥${(v / 10_000_000).toFixed(1)}千万`;
  if (v >= 10_000) return `¥${(v / 10_000).toFixed(0)}万`;
  return `¥${v.toLocaleString("ja-JP")}`;
}

function fmtMileage(km: number | null | undefined) {
  if (km == null) return null;
  if (km >= 10_000) return `${(km / 10_000).toFixed(1)}万km`;
  return `${km.toLocaleString()} km`;
}

export default function CarPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["car", id],
    queryFn: () => fetchCar(token!, Number(id)),
    enabled: !!token && !!id,
  });

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="aspect-video rounded-xl bg-slate-100" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-10 w-40 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  if (error || !data) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Автомобиль не найден</div>;

  const images = [data.primary_image, ...data.images.map((i) => i.url)].filter(Boolean) as string[];
  const uniqImages = Array.from(new Set(images));

  return (
    <div className="animate-fade-in">
      <Link href="/cars" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        К каталогу
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-slate-100">
              {uniqImages[activeImg] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uniqImages[activeImg]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
          {uniqImages.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
              {uniqImages.slice(0, 12).map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-md border-2 transition ${
                    i === activeImg ? "border-indigo-500" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {data.make || data.make_ja}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {data.model || data.model_ja}
          </h1>
          {data.grade && (
            <p className="mt-1 line-clamp-3 text-sm text-slate-600">{data.grade}</p>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Цена</div>
                <div className="mt-0.5 text-3xl font-bold text-slate-900">{fmtPrice(data.price_jpy)}</div>
              </div>
              {data.price_total_jpy && (
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-slate-400">С налогами</div>
                  <div className="mt-0.5 text-base font-semibold text-slate-700">{fmtPrice(data.price_total_jpy)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Год" value={data.year} />
            <Stat label="Пробег" value={fmtMileage(data.mileage_km)} />
            <Stat label="Кузов" value={data.body_type} />
            <Stat label="КПП" value={data.transmission} />
            <Stat label="Топливо" value={data.fuel} />
            <Stat label="Привод" value={data.drive} />
            <Stat label="Объём" value={data.engine_cc ? `${data.engine_cc} см³` : null} />
            <Stat label="Цвет" value={data.color} />
          </div>

          {(data.location || data.dealer || data.inspection_until) && (
            <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {data.location && <Row label="Локация" value={data.location} />}
              {data.dealer && <Row label="Дилер" value={data.dealer} />}
              {data.inspection_until && <Row label="Техосмотр до" value={data.inspection_until} />}
              {data.repaired != null && (
                <Row label="Ремонт" value={
                  <span className={data.repaired ? "text-amber-600" : "text-emerald-600"}>
                    {data.repaired ? "есть" : "нет"}
                  </span>
                } />
              )}
            </div>
          )}

          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Открыть на CarSensor
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {data.price_history.length > 1 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">История цены</h3>
          <div className="mt-3 space-y-1 text-sm">
            {data.price_history.map((p) => (
              <div key={p.observed_at} className="flex justify-between border-b border-slate-100 py-1.5 last:border-0">
                <span className="text-slate-500">
                  {new Date(p.observed_at).toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="font-medium text-slate-700">{fmtPrice(p.price_jpy)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
