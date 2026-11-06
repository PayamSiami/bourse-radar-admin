import {
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileFormData } from "@/lib/profile/types";
import { AvatarUploader } from "./AvatarUploader";

export function ProfileSummaryCard({
    formData,
    userVerified,
    uploadingAvatar,
    onAvatarUpload,
    onAvatarRemove,
    onGoToVerify,
}: {
    formData: ProfileFormData;
    userVerified: boolean;
    uploadingAvatar: boolean;
    onAvatarUpload: (file: File) => void;
    onAvatarRemove: () => void;
    onGoToVerify: () => void;
}) {
    const initials = (
        formData.displayName.trim() ||
        formData.email ||
        "ک"
    )
        .charAt(0)
        .toUpperCase();

    return (
        <Card className="overflow-hidden rounded-3xl border border-app bg-surface shadow-sm">
            <div className="h-24 bg-linear-to-l from-brand-600 via-brand-500 to-emerald-400" />

            <CardContent className="-mt-12 px-5 pb-6 sm:px-6">
                <div className="mb-4 flex items-end justify-between">
                    <AvatarUploader
                        avatarUrl={formData.avatarUrl}
                        initials={initials}
                        uploading={uploadingAvatar}
                        onUpload={onAvatarUpload}
                        onRemove={onAvatarRemove}
                    />

                    <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-app bg-app px-2.5 py-1 text-xs font-medium text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        حساب کاربری
                    </span>
                </div>

                <h2 className="break-words text-xl font-bold text-fg">
                    {formData.displayName.trim() || "کاربر بورس رادار"}
                </h2>

                <p
                    dir="ltr"
                    className="mt-2 break-all text-right text-sm text-muted"
                >
                    {formData.email}
                </p>

                <div className="my-5 h-px bg-app" />

                <div className="space-y-4">
                    <InfoRow
                        icon={<Mail size={17} />}
                        label="وضعیت ایمیل"
                        value={userVerified ? "تأیید شده" : "تأیید نشده"}
                        trailing={
                            userVerified ? (
                                <ShieldCheck
                                    size={19}
                                    className="mt-1 shrink-0 text-emerald-500"
                                />
                            ) : (
                                <ShieldAlert
                                    size={19}
                                    className="mt-1 shrink-0 text-amber-500"
                                />
                            )
                        }
                    />

                    <InfoRow
                        icon={<MapPin size={17} />}
                        label="موقعیت"
                        value={
                            [formData.city, formData.country].filter(Boolean).join("، ") ||
                            "ثبت نشده"
                        }
                    />

                    <InfoRow
                        icon={<Phone size={17} />}
                        label="شماره تماس"
                        value={formData.phone || "ثبت نشده"}
                        ltr
                    />
                </div>

                {!userVerified && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert
                                size={18}
                                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                            />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    ایمیل خود را تأیید کنید
                                </p>
                                <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                                    برای تکمیل امنیت حساب، وضعیت تأیید ایمیل را بررسی کنید.
                                </p>
                                <button
                                    type="button"
                                    onClick={onGoToVerify}
                                    className="mt-2 text-xs font-bold text-amber-800 underline underline-offset-4 dark:text-amber-300"
                                >
                                    رفتن به تأیید ایمیل
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InfoRow({
    icon,
    label,
    value,
    trailing,
    ltr = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trailing?: React.ReactNode;
    ltr?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{label}</p>
                <p
                    dir={ltr ? "ltr" : undefined}
                    className={`mt-1 text-sm font-semibold text-fg ${ltr ? "text-right" : "break-words"
                        }`}
                >
                    {value}
                </p>
            </div>
            {trailing}
        </div>
    );
}