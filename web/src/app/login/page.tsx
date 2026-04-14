"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await login(username, password);
      setToken(access_token);
      router.push("/cars");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-140px)] place-items-center">
      <div className="w-full max-w-md animate-fade-in">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-500 to-violet-600 px-8 py-6 text-white">
            <h1 className="text-xl font-semibold tracking-tight">Вход в систему</h1>
            <p className="mt-1 text-sm text-indigo-100">Авторизуйтесь, чтобы просматривать каталог</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 px-8 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Логин</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Вход…" : "Войти"}
            </button>
            <p className="text-center text-xs text-slate-400">
              Демо-доступ: <span className="font-mono text-slate-600">admin / admin123</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
