"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  McapPoint,
  McapSeriesResponse,
  fetchMcapSeries,
} from "@/lib/api";

type Range = 30 | 90 | 180 | 365 | 1855;

const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: "۳۰ روز" },
  { value: 90, label: "۳ ماه" },
  { value: 180, label: "۶ ماه" },
  { value: 365, label: "۱ سال" },
  { value: 1855, label: "۵ سال" },
];

type Currency = "usd" | "rial";

const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const faCompact = new Intl.NumberFormat("fa-IR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const faPct = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

export function MarketCapTab({ symbol }: { symbol: string }) {
  const [data, setData] = useState<McapSeriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<Range>(90);
  const [currency, setCurrency] = useState<Currency>("usd");
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);

    fetchMcapSeries(symbol, days)
      .then((d) => {
        if (id !== reqId.current) return;
        setData(d);
      })
      .catch((e: unknown) => {
        if (id !== reqId.current) return;
        setData(null);
        setError(e instanceof Error ? e.message : "خطای شبکه");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [symbol, days]);

  const latest = data?.points.at(-1);
  const first = data?.points.at(0);

  const periodChange = useMemo(() => {
    if (!first || !latest) return null;
    const start = currency === "usd" ? first.mcapUsd : first.mcapRial;
    const end = currency === "usd" ? latest.mcapUsd : latest.mcapRial;
    if (start == null || end == null || start === 0) return null;
    return ((end - start) / start) * 100;
  }, [first, latest, currency]);

  const isUp = periodChange != null ? periodChange >= 0 : true;

  return (
    <div className="rounded-2xl border border-app bg-surface overflow-hidden">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app px-5 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-sm font-bold text-fg flex items-center gap-1.5">
            ارزش بازار
            <span className="font-mono text-muted font-medium">{symbol}</span>
          </h2>

          {periodChange != null && !loading && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${isUp
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
            >
              {faPct.format(periodChange)}٪
            </span>
          )}

          {data && !loading && (
            <FxBadge
              quality={data.meta.fxQuality}
              density={data.meta.dataDensity}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Currency toggle */}
          <div className="flex items-center rounded-lg border border-app bg-surface-2/60 p-0.5">
            {(["usd", "rial"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                aria-pressed={currency === c}
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${currency === c
                  ? "bg-surface text-fg shadow-sm"
                  : "text-muted hover:text-fg"
                  }`}
              >
                {c === "usd" ? "دلار" : "ریال"}
              </button>
            ))}
          </div>

          {/* Range segmented control */}
          <div className="flex items-center rounded-lg border border-app bg-surface-2/60 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                aria-pressed={days === r.value}
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${days === r.value
                  ? "bg-surface text-fg shadow-sm"
                  : "text-muted hover:text-fg"
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="p-5">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <EmptyState title="خطا در بارگذاری" hint={error} tone="error" />
        ) : !data || data.points.length === 0 ? (
          <EmptyState
            title="داده‌ای برای نمایش نیست"
            hint="برای این نماد در بازه انتخابی رکوردی ثبت نشده است."
            tone="neutral"
          />
        ) : (
          <>
            <McapChart
              points={data.points}
              currency={currency}
              isUp={isUp}
            />

            {/* ── Summary ───────────────────────────────── */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="آخرین قیمت"
                value={latest?.priceRial ?? null}
                unit="ریال"
              />
              <Stat
                label="ارزش بازار (ریال)"
                value={latest?.mcapRial ?? null}
                unit="ریال"
              />
              <Stat
                label="ارزش بازار (دلار)"
                value={latest?.mcapUsd ?? null}
                unit="دلار"
                prefix="$"
              />
              <Stat
                label="نرخ ارز"
                value={latest?.fxRateToman ?? null}
                unit="تومان"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Chart
// ──────────────────────────────────────────────────────────
function McapChart({
  points,
  currency,
  isUp,
}: {
  points: McapPoint[];
  currency: Currency;
  isUp: boolean;
}) {
  // رنگ‌های حرفه‌ای‌تر (می‌تونی با brand خودت عوض کنی)
  const strokeColor = isUp ? "#059669" : "#e11d48"; // emerald-600 / rose-600
  const gradientFrom = isUp ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.22)";
  const gradientTo = "rgba(0,0,0,0)";

  const rows = useMemo(
    () =>
      points
        .filter((p) => p.date)
        .map((p) => ({
          date: p.date,
          value: (currency === "usd" ? p.mcapUsd : p.mcapRial) ?? null,
          price: p.priceRial ?? null,
          fx: p.fxRateToman ?? null,
        }))
        .filter((r) => r.value != null) as {
          date: string;
          value: number;
          price: number | null;
          fx: number | null;
        }[],
    [points, currency]
  );

  // High / Low + میانگین
  const { high, low, average } = useMemo(() => {
    if (rows.length === 0) return { high: null, low: null, average: null };

    let hi = rows[0];
    let lo = rows[0];
    let sum = 0;

    for (const r of rows) {
      if (r.value > hi.value) hi = r;
      if (r.value < lo.value) lo = r;
      sum += r.value;
    }

    return {
      high: hi,
      low: lo,
      average: sum / rows.length,
    };
  }, [rows]);

  const fmtTick = (v: number) =>
    currency === "usd" ? `$${faCompact.format(v)}` : faCompact.format(v);

  const gradientId = `mcap-grad-${currency}-${isUp ? "up" : "down"}`;

  return (
    <div className="text-fg relative" style={{ direction: "ltr" }}>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={rows}
          margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="95%" stopColor={gradientTo} />
            </linearGradient>
          </defs>

          {/* گرید خیلی ملایم */}
          <CartesianGrid
            strokeDasharray="3 6"
            stroke="currentColor"
            strokeOpacity={0.06}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            reversed
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
            tickLine={false}
            axisLine={false}
            minTickGap={56}
            tickFormatter={(v: string) => v.slice(5)} // فقط ماه-روز
            dy={8}
          />

          <YAxis
            orientation="right"
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
            tickLine={false}
            axisLine={false}
            width={58}
            tickFormatter={fmtTick}
            domain={["auto", "auto"]}
            dx={4}
          />

          {/* خط میانگین (خیلی حرفه‌ای) */}
          {average != null && (
            <ReferenceLine
              y={average}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
              label={{
                value: "میانگین",
                position: "insideTopLeft",
                fill: "currentColor",
                opacity: 0.4,
                fontSize: 9,
              }}
            />
          )}

          <Tooltip
            cursor={{
              stroke: strokeColor,
              strokeWidth: 1,
              strokeOpacity: 0.35,
              strokeDasharray: "4 4",
            }}
            content={<CustomTooltip currency={currency} />}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: "var(--surface)",
              fill: strokeColor,
            }}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />

          {/* نقطه High */}
          {high && (
            <ReferenceDot
              x={high.date}
              y={high.value}
              r={4}
              fill={strokeColor}
              stroke="var(--surface)"
              strokeWidth={2}
            />
          )}

          {/* نقطه Low */}
          {low && low.date !== high?.date && (
            <ReferenceDot
              x={low.date}
              y={low.value}
              r={4}
              fill={strokeColor}
              stroke="var(--surface)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* لیبل‌های High / Low بیرون از نمودار (اختیاری ولی زیبا) */}
      {high && low && (
        <div className="absolute top-2 left-3 flex gap-3 text-[10px] pointer-events-none">
          <span className="flex items-center gap-1 text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            بالاترین: {fmtTick(high.value)}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            پایین‌ترین: {fmtTick(low.value)}
          </span>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: { value: number; price: number | null; fx: number | null } }>;
  label?: string;
  currency: Currency;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;

  return (
    <div
      className="rounded-xl border border-app bg-surface px-3 py-2.5 shadow-lg text-[11px]"
      style={{ direction: "rtl" }}
    >
      <p className="text-muted mb-1.5 text-[10px]">{label}</p>
      <div className="space-y-1">
        <Row
          label="ارزش بازار"
          value={
            currency === "usd"
              ? `$${fa.format(p.value)}`
              : `${fa.format(p.value)} ریال`
          }
        />
        {p.price != null && (
          <Row label="قیمت" value={`${fa.format(p.price)} ریال`} />
        )}
        {p.fx != null && (
          <Row label="نرخ ارز" value={`${fa.format(p.fx)} تومان`} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-fg">{value}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Pieces
// ──────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  unit,
  prefix,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  prefix?: string;
}) {
  const display = value == null ? "—" : `${prefix ?? ""}${fa.format(value)}`;
  return (
    <div className="rounded-xl border border-app bg-surface-2/50 px-3 py-2.5">
      <p className="text-[10px] font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
        {display}
        {unit && value != null && (
          <span className="ms-1 text-[10px] font-normal text-muted">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function FxBadge({
  quality,
  density,
}: {
  quality: McapSeriesResponse["meta"]["fxQuality"];
  density: string;
}) {
  const config = {
    valid: { label: "نرخ ارز معتبر", tone: "ok" },
    suspicious: { label: "ناسازگاری نرخ ارز", tone: "warn" },
    fallback: { label: "منبع واحد (Wallex)", tone: "muted" },
  } as const;

  const c = config[quality as keyof typeof config] ?? config.fallback;
  const tone =
    c.tone === "ok"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : c.tone === "warn"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-app bg-surface-2 text-muted";

  return (
    <div className="flex items-center gap-1.5">
      <span
        title={c.label}
        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${tone}`}
      >
        {c.label}
      </span>
      <span className="rounded-md border border-app bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-muted">
        {density}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  hint,
  tone,
}: {
  title: string;
  hint?: string;
  tone: "neutral" | "error";
}) {
  return (
    <div className="flex h-[340px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-app bg-surface-2/30 text-center">
      <p
        className={`text-xs font-semibold ${tone === "error" ? "text-red-500" : "text-fg"
          }`}
      >
        {title}
      </p>
      {hint && <p className="max-w-xs text-[10px] text-muted leading-relaxed">{hint}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[340px] animate-pulse rounded-xl bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[58px] animate-pulse rounded-xl bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}