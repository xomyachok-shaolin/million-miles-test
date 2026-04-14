"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={token ? "/cars" : "/login"} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 10l1.5-4.5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 10m-18 0h18m-18 0v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M7 17h10" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Million Miles</span>
            <span className="text-[11px] text-slate-500">CarSensor Catalog</span>
          </div>
        </Link>
        {token && (
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Выйти
          </button>
        )}
      </div>
    </header>
  );
}
