import Link from "next/link";
import type { RankingItem } from "@/lib/api";
import {
  faPrice,
  faCompact,
  faPercent,
  num,
  scoreTier,
} from "@/lib/format";

const tier = {
  excellent: {
    bar: "from-brand-500 to-brand-400",
    text: "text-brand-600 dark:text-brand-400",
    badge:
      "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
    label: "عالی",
  },
  good: {
    bar: "from-teal-600 to-emerald-400",
    text: "text-teal-600 dark:text-teal-400",
    badge:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    label: "خوب",
  },
  fair: {
    bar: "from-amber-600 to-yellow-400",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "متوسط",
  },
  weak: {
    bar: "from-red-600 to-rose-400",
    text: "text-red-600 dark:text-red-400",
    badge:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    label: "ضعیف",
  },
} as const;

const confidenceStyles = {
  high: {
    label: "اطمینان بالا",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  medium: {
    label: "اطمینان متوسط",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  },
  low: {
    label: "اطمینان کم",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
  },
  non_calculable: {
    label: "P/E نامشخص",
    className:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
} as const;

type Confidence = keyof typeof confidenceStyles;

function ArrowIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "flat") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      {direction === "up" ? (
        <path d="m7 14 5-5 5 5" />
      ) : (
        <path d="m7 10 5 5 5-5" />
      )}
    </svg>
  );
}

export default function StockCard({
  stock,
}: {
  stock: RankingItem;
}) {
  const price = num(stock.currentPrice);
  const change = num(stock.priceChangePercent);
  const pe = num(stock.forwardPe);
  const eps = num(stock.estimatedAnnualEps);
  const volume = num(stock.dailyVolume);
  const score = num(stock.attractivenessScore) ?? 0;

  const scorePercent = Math.min(100, Math.max(0, score * 100));
  const t = tier[scoreTier(score)];

  const confKey: Confidence =
    typeof stock.confidence === "string" &&
      Object.prototype.hasOwnProperty.call(
        confidenceStyles,
        stock.confidence
      )
      ? (stock.confidence as Confidence)
      : "non_calculable";

  const confidence = confidenceStyles[confKey];

  const changeDirection =
    change === null || change === 0
      ? "flat"
      : change > 0
        ? "up"
        : "down";

  const peColor =
    pe === null
      ? "text-muted"
      : pe < 5
        ? "text-emerald-600 dark:text-emerald-400"
        : pe < 10
          ? "text-teal-600 dark:text-teal-400"
          : pe < 20
            ? "text-fg"
            : "text-muted";

  return (
    <Link
      href={`/stocks/${encodeURIComponent(stock.symbol)}`}
      aria-label={`مشاهده تحلیل نماد ${stock.symbol}، ${stock.name} `}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
    >
      <article
        dir="rtl"
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-app bg-surface p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-lg motion-reduce:transition-none sm:p-5"
      >
        {/* Subtle top accent */}
        <div
          aria-hidden="true"
          className={`absolute inset - x - 0 top - 0 h - 1 bg - gradient - to - l ${t.bar} `}
        />

        {/* Symbol and ranking */}
        <header className="flex items-start gap-3 pt-1">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[10px] font-semibold leading-4 ${confidence.className}`}
            >
              {stock.rank}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-extrabold leading-7 text-fg transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {stock.symbol}
              </h3>

              <p className="mt-0.5 line-clamp-2 min-h-5 text-xs leading-5 text-muted">
                {stock.name}
              </p>

              <span className="mt-2 inline-flex max-w-full items-center rounded-lg border border-app bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">
                <span className="truncate">{stock.sector}</span>
              </span>
            </div>
          </div>

          <span
            title={
              confKey === "non_calculable"
                ? "نسبت P/E آینده‌نگر برای این نماد قابل محاسبه نیست."
                : confidence.label
            }
            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[10px] font-semibold leading-4 ${confidence.className}`}
          >
            {confidence.label}
          </span>
        </header>

        {/* Attractiveness score */}
        <section
          aria-label="امتیاز جذابیت"
          className="mt-6 rounded-xl border border-app bg-surface-2/50 p-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">
                امتیاز جذابیت
              </p>

              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span
                  className={`text - 3xl font - black tabular - nums tracking - tight ${t.text} `}
                >
                  {Math.round(scorePercent).toLocaleString("fa-IR")}
                </span>
                <span className="text-xs text-muted">از ۱۰۰</span>
              </div>
            </div>

            <span
              className={`rounded - lg px - 3 py - 1.5 text - xs font - bold ${t.badge} `}
            >
              {t.label}
            </span>
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
            role="progressbar"
            aria-label="درصد امتیاز جذابیت"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scorePercent)}
          >
            <div
              className={`h - full rounded - full bg - gradient - to - l ${t.bar} transition - [width] duration - 500 motion - reduce: transition - none`}
              style={{ width: `${scorePercent}% ` }}
            />
          </div>
        </section>

        {/* Price and daily change */}
        <section className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              آخرین قیمت
            </p>

            <p
              className="mt-2 truncate text-2xl font-extrabold leading-tight tracking-tight text-fg tabular-nums sm:text-3xl"
              title={price !== null ? String(price) : undefined}
            >
              {price !== null ? faPrice(price) : "—"}
            </p>

            <p className="mt-1 text-[11px] text-muted">
              ریال
            </p>
          </div>

          <div className="text-left">
            <p className="text-xs font-medium text-muted">
              تغییر روزانه
            </p>

            <div
              className={`mt - 2 inline - flex items - center gap - 1 rounded - lg px - 2 py - 1.5 text - sm font - bold tabular - nums ${change === null || change === 0
                ? "bg-surface-2 text-muted"
                : change > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                } `}
            >
              <ArrowIcon direction={changeDirection} />

              <span>
                {change !== null ? faPercent(change) : "—"}
              </span>
            </div>
          </div>
        </section>

        {/* Financial metrics */}
        <section
          aria-label="شاخص‌های مالی"
          className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-app border-t border-app pt-4"
        >
          <Metric
            label="P/E آینده"
            value={pe !== null ? pe.toFixed(2) : "—"}
            accent={
              confKey === "non_calculable" ? "text-muted" : peColor
            }
          />

          <Metric
            label="EPS برآوردی"
            value={eps !== null ? faPrice(eps) : "—"}
          />

          <Metric
            label="حجم معاملات"
            value={volume !== null ? faCompact(volume) : "—"}
          />
        </section>

        {/* Details affordance */}
        <div className="mt-4 flex items-center justify-between border-t border-app/70 pt-3 text-xs">
          <span className="text-muted">
            مشاهده تحلیل نماد
          </span>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
      </article>
    </Link>
  );
}

function Metric({
  label,
  value,
  accent = "text-fg",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="min-w-0 px-1.5 text-center first:pr-0 last:pl-0 sm:px-2">
      <p className="truncate text-[10px] font-medium leading-5 text-muted sm:text-xs">
        {label}
      </p>

      <p
        className={`mt - 1 break-words text - xs font - bold leading - 5 tabular - nums sm: text - sm ${accent} `}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}