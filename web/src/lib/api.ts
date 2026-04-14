export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:8000");

export type CarListItem = {
  id: number;
  source_id: string;
  url: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage_km: number | null;
  price_jpy: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel: string | null;
  primary_image: string | null;
  location: string | null;
  updated_at: string;
};

export type CarDetail = CarListItem & {
  make_ja: string | null;
  model_ja: string | null;
  grade: string | null;
  price_total_jpy: number | null;
  body_type_ja: string | null;
  transmission_ja: string | null;
  fuel_ja: string | null;
  drive: string | null;
  engine_cc: number | null;
  color: string | null;
  color_ja: string | null;
  dealer: string | null;
  inspection_until: string | null;
  repaired: boolean | null;
  images: { url: string; position: number }[];
  price_history: { price_jpy: number; observed_at: string }[];
};

export type CarListResponse = {
  items: CarListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username: string, password: string): Promise<{ access_token: string; expires_in: number }> {
  const r = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Invalid credentials");
  return r.json();
}

export async function fetchCars(token: string, params: Record<string, string | number | undefined>): Promise<CarListResponse> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
  }
  const r = await fetch(`${API_URL}/cars?${q.toString()}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error("Failed to load cars");
  return r.json();
}

export async function fetchCar(token: string, id: number): Promise<CarDetail> {
  const r = await fetch(`${API_URL}/cars/${id}`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error("Failed to load car");
  return r.json();
}

export type Filters = {
  makes: string[];
  body_types: string[];
  transmissions: string[];
  fuels: string[];
  drives: string[];
  year: { min: number | null; max: number | null };
  price: { min: number | null; max: number | null };
  mileage: { min: number | null; max: number | null };
};

export async function fetchFilters(token: string): Promise<Filters> {
  const r = await fetch(`${API_URL}/cars/filters`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error("Failed to load filters");
  return r.json();
}

export type Rates = {
  JPY_to_RUB: number;
  USD_to_RUB: number;
  EUR_to_RUB: number;
  timestamp: number;
};

export async function fetchRates(): Promise<Rates> {
  const r = await fetch(`${API_URL}/rates`);
  if (!r.ok) throw new Error("Failed to load rates");
  return r.json();
}

export type Stats = {
  total: number;
  makes_count: number;
  avg_price_jpy: number | null;
  min_price_jpy: number | null;
  max_price_jpy: number | null;
  new_24h: number;
  last_updated_at: string | null;
  top_makes: { make: string; count: number }[];
};

export async function fetchStats(token: string): Promise<Stats> {
  const r = await fetch(`${API_URL}/stats`, { headers: authHeaders(token) });
  if (!r.ok) throw new Error("Failed to load stats");
  return r.json();
}
