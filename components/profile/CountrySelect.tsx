"use client";

import { useMemo, useState } from "react";
import { Globe2, Check, ChevronDown } from "lucide-react";
import { COUNTRIES, getCountryLabel } from "@/lib/profile/countries";

export function CountrySelect({
    value,
    onChange,
    disabled,
}: {
    value: string; // 2-letter code or ""
    onChange: (code: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return COUNTRIES;
        return COUNTRIES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.nameEn.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q)
        );
    }, [query]);

    const selectedLabel = value ? getCountryLabel(value) : "";

    return (
        <div className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-app bg-app px-3.5 text-sm text-fg transition hover:border-app/80 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-60"
            >
                <span className="flex items-center gap-2">
                    <Globe2 size={17} className="text-muted" />
                    {value ? (
                        <>
                            <span className="font-mono text-xs text-muted">{value}</span>
                            <span>{selectedLabel}</span>
                        </>
                    ) : (
                        <span className="text-muted">کشور خود را انتخاب کنید</span>
                    )}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-muted transition ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                        aria-hidden
                    />

                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-xl border border-app bg-surface shadow-xl">
                        <div className="border-b border-app p-2">
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="جستجو..."
                                className="h-9 w-full rounded-lg border border-app bg-app px-3 text-sm outline-none focus:ring-2 focus:ring-brand-400/40"
                            />
                        </div>

                        <div className="max-h-56 overflow-y-auto py-1">
                            {filtered.length === 0 && (
                                <p className="px-3 py-2 text-xs text-muted">
                                    کشوری یافت نشد
                                </p>
                            )}

                            {filtered.map((c) => {
                                const active = c.code === value;
                                return (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                            onChange(c.code);
                                            setOpen(false);
                                            setQuery("");
                                        }}
                                        className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-surface-2 ${active ? "bg-brand-500/10 text-brand-600" : "text-fg"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="w-8 font-mono text-[11px] text-muted">
                                                {c.code}
                                            </span>
                                            <span>{c.name}</span>
                                        </span>
                                        {active && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}