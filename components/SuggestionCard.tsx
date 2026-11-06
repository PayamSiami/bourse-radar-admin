import Link from "next/link";
import { SuggestionFull } from "@/lib/api";
import { faPrice, faCompact, num, scoreTier } from "@/lib/format";

const tier = {
    excellent: {
        bar: "bg-brand-500",
        text: "text-brand-600 dark:text-brand-400",
        ring: "ring-brand-500/30",
    },
    good: {
        bar: "bg-teal-500",
        text: "text-teal-600 dark:text-teal-400",
        ring: "ring-teal-500/20",
    },
    fair: {
        bar: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        ring: "ring-amber-500/20",
    },
    weak: {
        bar: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
        ring: "ring-red-500/20",
    },
} as const;

// ─── Confidence maps ─────────────────────────────────────
// Widened to Record<string, string> because `rawData.confidence`
// comes from the DB as a free-form string (may be "non_calculable",
// empty, or undefined). Falls back to `low` / "نامشخص" at use sites.

const confBadge: Record<string, string> = {
    high: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20",
    medium:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    low: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
};

const confFa: Record<string, string> = {
    high: "بالا",
    medium: "متوسط",
    low: "کم",
};

const trendArrow = {
    up: "↗️",
    down: "↘️",
    neutral: "→",
} as const;

const trendLabel = {
    up: "صعودی",
    down: "نزولی",
    neutral: "خنثی",
} as const;

type TrendDir = keyof typeof trendArrow;

export default function SuggestionCard({ item }: { item: SuggestionFull }) {
    // Fallback branch (LLM failed for this item)
    if (item.fallback && item.rawData) {
        return <FallbackCard item={item} />;
    }

    // Full LLM branch
    const headline = item.headline;
    const trendDirection: TrendDir =
        item.trendDirection && item.trendDirection in trendArrow
            ? (item.trendDirection as TrendDir)
            : "neutral";
    const trendArrowSymbol = trendArrow[trendDirection];
    const trendLabelText = trendLabel[trendDirection];
    const confidenceScore = item.confidenceScore || 50;
    const nearTermOutlook = item.nearTermOutlook || "چشم‌انداز نامشخص";

    // Determine confidence tier — typed as a literal key so
    // confBadge[confidenceTier] type-checks without widening.
    let confidenceTier: "high" | "medium" | "low" = "medium";
    if (confidenceScore >= 70) confidenceTier = "high";
    else if (confidenceScore <= 40) confidenceTier = "low";

    return (
        <article className="rounded-2xl bg-surface border border-app ring-1 ring-inset ring-black/2 dark:ring-white/2 p-5 flex flex-col gap-4 hover:border-brand-200 dark:hover:border-brand-500/30 transition">
            {/* Headline with trend indicator */}
            <header className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold leading-snug text-fg flex-1">{headline}</h3>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl">{trendArrowSymbol}</span>
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${confBadge[confidenceTier]}`}
                    >
                        اطمینان {confFa[confidenceTier]} ({confidenceScore}%)
                    </span>
                </div>
            </header>

            {/* Analysis */}
            <p className="text-[13px] leading-relaxed text-muted">{item.analysis}</p>

            {/* Trend prediction banner */}
            <div className="rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">{trendArrowSymbol}</div>
                    <div className="flex-1">
                        <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-400 mb-1">
                            روند کوتاه‌مدت: {trendLabelText}
                        </p>
                        <p className="text-[12px] text-muted leading-relaxed">
                            {nearTermOutlook}
                        </p>
                    </div>
                </div>
            </div>

            {/* Positive / Risk factors side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FactorList
                    title="نقاط قوت"
                    icon="✓"
                    accent="text-brand-600 dark:text-brand-400"
                    border="border-brand-200 dark:border-brand-500/20"
                    bg="bg-brand-50 dark:bg-brand-500/5"
                    items={item.positiveFactors}
                />
                <FactorList
                    title="ریسک‌ها"
                    icon="!"
                    accent="text-red-600 dark:text-red-400"
                    border="border-red-200 dark:border-red-500/20"
                    bg="bg-red-50 dark:bg-red-500/5"
                    items={item.riskFactors}
                />
            </div>

            {/* Progressive disclosure: reasoning + uncertainty */}
            <details className="group">
                <summary className="cursor-pointer text-[11px] text-muted hover:text-fg transition select-none flex items-center gap-1.5 list-none">
                    <span className="inline-block transition-transform group-open:rotate-90">
                        ▸
                    </span>
                    استدلال کمّی و افشای عدم قطعیت
                </summary>
                <div className="mt-3 space-y-3 text-[12px] leading-relaxed">
                    <div className="rounded-lg bg-surface-2 border border-app p-3">
                        <p className="text-[10px] text-muted mb-1.5 font-semibold">
                            استدلال کمّی
                        </p>
                        <p className="text-muted">{item.quantitativeReasoning}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-3">
                        <p className="text-[10px] text-amber-700 dark:text-amber-500/80 mb-1.5 font-semibold">
                            عدم قطعیت
                        </p>
                        <p className="text-muted">{item.uncertaintyDisclosure}</p>
                    </div>
                </div>
            </details>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted/80 leading-relaxed border-t border-app pt-3">
                {item.disclaimer}
            </p>
        </article>
    );
}

/* ---------- Fallback card ---------- */

function FallbackCard({ item }: { item: SuggestionFull }) {
    const d = item.rawData!;
    const score = num(d.attractiveness_score) ?? 0;
    const price = num(d.last_price);
    const pe = num(d.forward_pe);
    const eps = num(d.estimated_annual_eps);
    const volume = num(d.volume);
    const t = tier[scoreTier(score)];

    // `d.confidence` is `unknown`/`string` from rawData. Coerce once;
    // fall back to `low` / "نامشخص" if the DB sent "non_calculable" or null.
    const rawConf = typeof d.confidence === "string" ? d.confidence : "";
    const confKey = rawConf in confFa ? rawConf : "low";
    const confLabel = confFa[confKey] ?? "نامشخص";
    const confBadgeClass = confBadge[confKey] ?? confBadge.low;

    return (
        <article
            className={`rounded-2xl bg-surface border border-app ring-1 ring-inset ${t.ring} p-5 flex flex-col gap-4`}
        >
            <header className="flex items-start justify-between gap-3">
                <div>
                    <Link
                        href={`/stocks/${encodeURIComponent(String(d.symbol))}`}
                        className="text-base font-bold text-fg hover:text-brand-600 dark:hover:text-brand-400 transition"
                    >
                        {String(d.symbol)}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">{String(d.name ?? "")}</p>
                    <p className="text-[10px] text-muted/70 mt-1">
                        {String(d.sector ?? "")}
                    </p>
                </div>
                <span
                    className={`shrink-0 text-[10px] px-2 py-1 rounded-full border ${confBadgeClass}`}
                >
                    اطمینان {confLabel}
                </span>
            </header>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-3 text-[11px] text-amber-700 dark:text-amber-400/90">
                ⚠️ تحلیل هوش مصنوعی برای این نماد در دسترس نیست. داده‌های خام نمایش داده
                می‌شود.
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <Metric label="قیمت" value={price !== null ? faPrice(price) : "—"} />
                <Metric label="P/E" value={pe !== null ? pe.toFixed(2) : "—"} />
                <Metric
                    label="امتیاز"
                    value={(score * 100).toFixed(0)}
                    accent={t.text}
                />
                <Metric label="EPS" value={eps !== null ? faPrice(eps) : "—"} />
                <Metric
                    label="حجم"
                    value={volume !== null ? faCompact(volume) : "—"}
                />
                <Metric
                    label="رتبه"
                    value={d.overallRank != null ? String(d.overallRank) : "—"}
                />
            </div>

            <p className="text-[10px] text-muted/80 leading-relaxed border-t border-app pt-3">
                {String(d.disclaimer ?? "")}
            </p>
        </article>
    );
}

/* ---------- Small building blocks ---------- */

function FactorList({
    title,
    icon,
    accent,
    border,
    bg,
    items,
}: {
    title: string;
    icon: string;
    accent: string;
    border: string;
    bg: string;
    items: string[];
}) {
    if (!items?.length) return null;
    return (
        <div className={`rounded-xl ${bg} border ${border} p-3`}>
            <p
                className={`text-[10px] font-semibold ${accent} mb-2 flex items-center gap-1.5`}
            >
                <span>{icon}</span>
                {title}
            </p>
            <ul className="space-y-1.5">
                {items.map((f, i) => (
                    <li
                        key={i}
                        className="text-[11px] text-muted leading-relaxed flex gap-2"
                    >
                        <span className={`${accent} opacity-60 shrink-0`}>•</span>
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
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
        <div>
            <p className="text-[10px] text-muted mb-0.5">{label}</p>
            <p className={`text-sm font-semibold tabular ${accent}`}>{value}</p>
        </div>
    );
}