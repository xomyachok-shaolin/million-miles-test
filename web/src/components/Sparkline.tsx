"use client";

type Point = { price_jpy: number; observed_at: string };

export default function Sparkline({
  data,
  width = 320,
  height = 80,
}: {
  data: Point[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const sorted = [...data].sort(
    (a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime()
  );
  const prices = sorted.map((p) => p.price_jpy);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = sorted.map((p, i) => {
    const x = pad + (i * w) / (sorted.length - 1);
    const y = pad + h - ((p.price_jpy - min) / range) * h;
    return [x, y];
  });

  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${(pad + h).toFixed(1)} L${pts[0][0].toFixed(1)},${(pad + h).toFixed(1)} Z`;

  const trend = prices[prices.length - 1] - prices[0];
  const trendColor = trend > 0 ? "#ef4444" : trend < 0 ? "#10b981" : "#6366f1";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparklineFill)" />
      <path d={path} fill="none" stroke={trendColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 3 : 2}
          fill={trendColor}
          stroke="white"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
