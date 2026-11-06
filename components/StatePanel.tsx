import React from 'react'

export default function StatePanel({
    tone,
    title,
    body,
    action,
}: {
    tone: "empty" | "error";
    title: string;
    body?: string;
    action?: { label: string; onClick: () => void; disabled?: boolean };
}) {

    const palette =
        tone === "error"
            ? {
                wrap:
                    "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
                iconWrap:
                    "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
                title: "text-red-800 dark:text-red-300",
                body: "text-red-700 dark:text-red-300/80",
                btn: "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
                icon: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
            }
            : {
                wrap: "border-app bg-surface-2/40 border-dashed",
                iconWrap: "bg-surface text-muted",
                title: "text-fg",
                body: "text-muted",
                btn: "bg-surface border border-app hover:border-brand-300 dark:hover:border-brand-500/40 text-fg",
                icon: "M3 3v18h18M7 15l4-4 3 3 5-6",
            };
    return (
        <div
            role={tone === "error" ? "status" : undefined}
            aria-live={tone === "error" ? "polite" : undefined}
            className={`flex flex-col items-center gap-3 rounded-2xl border px-6 py-12 text-center ${palette.wrap}`}
        >
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.iconWrap}`}
            >
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d={palette.icon} />
                </svg>
            </div>

            <div className="space-y-1">
                <p className={`text-sm font-bold ${palette.title}`}>{title}</p>
                {body && (
                    <p className={`mx-auto max-w-md text-xs leading-6 ${palette.body}`}>
                        {body}
                    </p>
                )}
            </div>

            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${palette.btn}`}
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
