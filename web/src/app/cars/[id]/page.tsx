"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCar } from "@/lib/api";
import { useAuth } from "@/store/auth";

function fmtPrice(v: number | null | undefined) {
  if (v == null) return "—";
  return `¥${v.toLocaleString("ja-JP")}`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function CarPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["car", id],
    queryFn: () => fetchCar(token!, Number(id)),
    enabled: !!token && !!id,
  });

  if (isLoading) return <div>Загрузка…</div>;
  if (error || !data) return <div className="text-red-600">Не найдено</div>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        {data.primary_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.primary_image} alt="" className="w-full rounded border object-cover" />
        )}
        {data.images.length > 1 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {data.images.slice(1, 9).map((im) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={im.url} src={im.url} alt="" className="aspect-video w-full rounded border object-cover" />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          {data.make} {data.model}
        </h1>
        {data.grade && <div className="mb-4 text-neutral-600">{data.grade}</div>}
        <div className="mb-4 text-3xl font-bold">{fmtPrice(data.price_jpy)}</div>

        <div className="divide-y rounded border bg-white px-4">
          <Row label="Год" value={data.year} />
          <Row label="Пробег" value={data.mileage_km != null ? `${data.mileage_km.toLocaleString()} км` : null} />
          <Row label="Кузов" value={data.body_type} />
          <Row label="КПП" value={data.transmission} />
          <Row label="Топливо" value={data.fuel} />
          <Row label="Привод" value={data.drive} />
          <Row label="Объём" value={data.engine_cc ? `${data.engine_cc} cc` : null} />
          <Row label="Цвет" value={data.color} />
          <Row label="Город" value={data.location} />
          <Row label="Дилер" value={data.dealer} />
          <Row label="Техосмотр" value={data.inspection_until} />
          <Row label="Цена с налогами" value={fmtPrice(data.price_total_jpy)} />
          <Row label="Ремонт" value={data.repaired == null ? null : data.repaired ? "есть" : "нет"} />
        </div>

        <a href={data.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-blue-600 underline">
          Источник на CarSensor →
        </a>
      </div>
    </div>
  );
}
