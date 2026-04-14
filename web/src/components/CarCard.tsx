import Link from "next/link";
import type { CarListItem } from "@/lib/api";

function fmtPrice(v: number | null) {
  if (v == null) return "—";
  if (v >= 10_000_000) return `¥${(v / 10_000_000).toFixed(1)}千万`;
  if (v >= 10_000) return `¥${(v / 10_000).toFixed(0)}万`;
  return `¥${v.toLocaleString("ja-JP")}`;
}

function fmtMileage(km: number | null) {
  if (km == null) return null;
  if (km >= 10_000) return `${(km / 10_000).toFixed(1)}万km`;
  return `${km.toLocaleString()} km`;
}

export default function CarCard({ car }: { car: CarListItem }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {car.primary_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.primary_image}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 10l1.5-4.5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 10m-18 0h18m-18 0v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M7 17h10" />
            </svg>
          </div>
        )}
        {car.body_type && (
          <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-medium text-slate-700 backdrop-blur">
            {car.body_type}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium uppercase tracking-wide text-indigo-600">
              {car.make || "—"}
            </div>
            <div className="truncate text-base font-semibold text-slate-900">
              {car.model || "—"}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold text-slate-900">{fmtPrice(car.price_jpy)}</div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {car.year && <span>{car.year} г.</span>}
          {fmtMileage(car.mileage_km) && <span>{fmtMileage(car.mileage_km)}</span>}
          {car.transmission && <span>{car.transmission}</span>}
          {car.fuel && <span>{car.fuel}</span>}
        </div>

        {car.location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{car.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
