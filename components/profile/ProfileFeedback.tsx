import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ProfileFeedback({
    error,
    success,
    onDismissError,
    onDismissSuccess,
}: {
    error: string | null;
    success: string | null;
    onDismissError: () => void;
    onDismissSuccess: () => void;
}) {
    return (
        <>
            {error && (
                <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <p className="flex-1 leading-6">{error}</p>
                    <button
                        type="button"
                        onClick={onDismissError}
                        aria-label="بستن"
                        className="text-red-400 hover:text-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                    <p className="flex-1 leading-6">{success}</p>
                    <button
                        type="button"
                        onClick={onDismissSuccess}
                        aria-label="بستن"
                        className="text-emerald-500 hover:text-emerald-700"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}