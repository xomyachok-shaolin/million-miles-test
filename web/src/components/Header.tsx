"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/cars" className="text-lg font-semibold">
          Million Miles · CarSensor
        </Link>
        {token && (
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
          >
            Выйти
          </button>
        )}
      </div>
    </header>
  );
}
