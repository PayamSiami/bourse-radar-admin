import { LoaderCircle } from "lucide-react";

export function ProfilePageSkeleton() {
    return (
        <main
            dir="rtl"
            className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-app p-6"
        >
            <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10">
                    <LoaderCircle size={28} className="animate-spin text-brand-500" />
                </div>
                <p className="text-sm text-muted">در حال بارگذاری پروفایل...</p>
            </div>
        </main>
    );
}