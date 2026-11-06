"use client";

import { useRef } from "react";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";

export function AvatarUploader({
    avatarUrl,
    initials,
    uploading,
    onUpload,
    onRemove,
}: {
    avatarUrl: string;
    initials: string;
    uploading: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) onUpload(file);
    };

    return (
        <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-surface bg-gradient-to-br from-brand-500 to-emerald-400 text-3xl font-extrabold text-white shadow-lg">
                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatarUrl}
                        alt="تصویر پروفایل"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    initials
                )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 rounded-lg border border-app bg-app px-2 py-1 text-[10px] font-medium text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-50"
                >
                    {uploading ? (
                        <LoaderCircle size={12} className="animate-spin" />
                    ) : (
                        <Camera size={12} />
                    )}
                    {uploading ? "آپلود..." : "تغییر"}
                </button>

                {avatarUrl && (
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={uploading}
                        className="inline-flex items-center gap-1 rounded-lg border border-app bg-app px-2 py-1 text-[10px] font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/20"
                    >
                        <Trash2 size={12} />
                        حذف
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}