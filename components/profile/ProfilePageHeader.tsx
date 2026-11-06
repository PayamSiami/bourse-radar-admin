import { ArrowRight, LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/card";

export function ProfilePageHeader({
    onBack,
    onLogout,
    loggingOut,
    hasChanges,
}: {
    onBack: () => void;
    onLogout: () => void;
    loggingOut: boolean;
    hasChanges: boolean;
}) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <button
                    type="button"
                    onClick={() => {
                        if (
                            hasChanges &&
                            !window.confirm("تغییرات ذخیره نشده است. خارج می‌شوید؟")
                        )
                            return;
                        onBack();
                    }}
                    className="mb-3 inline-flex items-center gap-2 rounded-lg text-sm text-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                    <ArrowRight size={16} />
                    بازگشت
                </button>

                <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
                    پروفایل من
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                    اطلاعات حساب و مشخصات شخصی خود را مدیریت کنید.
                </p>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl"
            >
                {loggingOut ? (
                    <LoaderCircle size={17} className="animate-spin" />
                ) : (
                    <LogOut size={17} />
                )}
                {loggingOut ? "در حال خروج..." : "خروج از حساب"}
            </Button>
        </div>
    );
}