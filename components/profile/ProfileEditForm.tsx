"use client";

import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    Save,
    LoaderCircle,
    RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ProfileFormData } from "@/lib/profile/types";
import { CountrySelect } from "./CountrySelect";

export function ProfileEditForm({
    formData,
    saving,
    hasChanges,
    onChange,
    onReset,
    onSubmit,
}: {
    formData: ProfileFormData;
    saving: boolean;
    hasChanges: boolean;
    onChange: (field: keyof ProfileFormData, value: string) => void;
    onReset: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <Card className="rounded-3xl border border-app bg-surface shadow-sm">
            <CardHeader className="border-b border-app px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                        <UserRound size={21} />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-fg">
                            اطلاعات شخصی
                        </CardTitle>
                        <p className="mt-1 text-xs leading-5 text-muted">
                            مشخصات خود را به‌روز نگه دارید.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-7">
                <form onSubmit={onSubmit} className="space-y-6">
                    <Section title="اطلاعات اصلی">
                        <Field
                            id="displayName"
                            label="نام نمایشی"
                            icon={<UserRound size={17} />}
                            value={formData.displayName}
                            onChange={(v) => onChange("displayName", v)}
                            disabled={saving}
                            placeholder="نام و نام خانوادگی"
                            autoComplete="name"
                            maxLength={80}
                        />

                        <Field
                            id="email"
                            label="آدرس ایمیل"
                            icon={<Mail size={17} />}
                            value={formData.email}
                            onChange={() => { }}
                            disabled
                            readOnly
                            dir="ltr"
                            helper="ایمیل از این بخش قابل تغییر نیست."
                        />
                    </Section>

                    <div className="h-px bg-app" />

                    <Section title="اطلاعات تماس و موقعیت">
                        <Field
                            id="phone"
                            label="شماره تماس"
                            icon={<Phone size={17} />}
                            value={formData.phone}
                            onChange={(v) => onChange("phone", v)}
                            disabled={saving}
                            placeholder="09123456789"
                            autoComplete="tel"
                            dir="ltr"
                            type="tel"
                            maxLength={30}
                        />

                        <Field
                            id="city"
                            label="شهر"
                            icon={<MapPin size={17} />}
                            value={formData.city}
                            onChange={(v) => onChange("city", v)}
                            disabled={saving}
                            placeholder="مثلاً تهران"
                            autoComplete="address-level2"
                            maxLength={100}
                        />

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="country"
                                className="mb-2 block text-sm font-medium text-fg"
                            >
                                کشور
                            </label>
                            <CountrySelect
                                value={formData.country}
                                onChange={(code) => onChange("country", code)}
                                disabled={saving}
                            />
                            <p className="mt-2 text-xs text-muted">
                                کد دو حرفی کشور (مثلاً IR برای ایران).
                            </p>
                        </div>
                    </Section>

                    <div className="flex flex-col-reverse gap-3 border-t border-app pt-5 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onReset}
                            disabled={saving || !hasChanges}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl"
                        >
                            <RotateCcw size={16} />
                            بازگردانی
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving || !hasChanges}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    ذخیره تغییرات
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ── Internal helpers ── */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="mb-4 text-sm font-bold text-fg">{title}</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function Field({
    id,
    label,
    icon,
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    autoComplete,
    maxLength,
    dir,
    type = "text",
    readOnly,
    helper,
}: {
    id: string;
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    autoComplete?: string;
    maxLength?: number;
    dir?: "ltr" | "rtl";
    type?: string;
    readOnly?: boolean;
    helper?: string;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
                    {icon}
                </span>
                <Input
                    id={id}
                    name={id}
                    type={type}
                    dir={dir}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    className={`h-12 w-full rounded-xl border-app bg-app pr-10 ${dir === "ltr" ? "text-left" : ""
                        } ${readOnly ? "opacity-70" : ""}`}
                />
            </div>
            {helper && <p className="mt-2 text-xs text-muted">{helper}</p>}
        </div>
    );
}