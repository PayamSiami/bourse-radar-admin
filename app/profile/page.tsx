"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";
import { ProfilePageHeader } from "@/components/profile/ProfilePageHeader";
import { ProfileFeedback } from "@/components/profile/ProfileFeedback";
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

import type { ProfileFormData } from "@/lib/profile/types";
import { EMPTY_FORM } from "@/lib/profile/types";
import {
  s,
  toFormData,
  extractErrorMessage,
} from "@/lib/profile/helpers";
import { authHeaders } from "@/lib/tickets/api";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const [initialData, setInitialData] = useState<ProfileFormData>(EMPTY_FORM);

  // ✅ FIX #3: hydrate only once per user.id, never reset on identity change
  const hydratedForUserId = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (hydratedForUserId.current === user.id) return;
    hydratedForUserId.current = user.id;

    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const storedUser = raw ? JSON.parse(raw) : {};

      const profile: ProfileFormData = {
        displayName: s(storedUser.displayName) || s(user.displayName),
        email: s(user.email),
        avatarUrl: s(storedUser.avatarUrl) || s(user.avatarUrl),
        phone: s(storedUser.phone),
        country: s(storedUser.country),
        city: s(storedUser.city),
      };

      setFormData(profile);
      setInitialData(profile);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setFormData({
        ...EMPTY_FORM,
        email: s(user.email),
        displayName: s(user.displayName),
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ FIX #7: field-by-field comparison (no key-order dependency)
  const hasChanges = useMemo(
    () =>
      (Object.keys(formData) as (keyof ProfileFormData)[]).some(
        (k) => formData[k] !== initialData[k]
      ),
    [formData, initialData]
  );

  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  // ✅ FIX #2: preserve fields canonical doesn't include
  const applyCanonicalUser = (serverUser: any) => {
    if (!serverUser) return;

    const canonical = toFormData(serverUser, s(user?.email));

    const merged = {
      ...user,
      ...canonical,
      username: serverUser.username ?? (user as any)?.username,
      emailVerifiedAt:
        serverUser.emailVerifiedAt ?? (user as any)?.emailVerifiedAt,
      token: user?.token,
      verified: serverUser.verified ?? user?.verified ?? false,
    };

    try {
      localStorage.setItem("user", JSON.stringify(merged));
    } catch {
      /* ignore */
    }
    updateUser(merged as any);

    setFormData(canonical);
    setInitialData(canonical);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || saving || !hasChanges) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        displayName: formData.displayName.trim(),
        phone: formData.phone.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        avatarUrl: formData.avatarUrl.trim(),
      };

      const response = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(
            body,
            "ذخیره اطلاعات انجام نشد. دوباره تلاش کنید."
          )
        );
      }

      if (body?.user) {
        applyCanonicalUser(body.user);
      } else {
        setFormData((c) => ({ ...c, ...payload }));
        setInitialData((c) => ({ ...c, ...payload }));
        const merged = { ...user, ...payload, email: user.email };
        localStorage.setItem("user", JSON.stringify(merged));
        updateUser(merged);
      }

      setSuccess(body?.message ?? "تغییرات پروفایل با موفقیت ذخیره شد.");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(
        err instanceof Error ? err.message : "خطایی رخ داد. دوباره تلاش کنید."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload ──
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("حجم تصویر نباید بیشتر از ۲ مگابایت باشد.");
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setError("فرمت تصویر مجاز نیست (JPG، PNG، WebP، GIF).");
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch(`${API}/auth/me/avatar`, {
        method: "POST",
        // ✅ FIX #4: consistent auth, but let browser set Content-Type
        headers: authHeaders(),
        body: fd,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          extractErrorMessage(body, "آپلود تصویر انجام نشد.")
        );
      }

      // ✅ FIX #5: require a URL
      const newUrl: string =
        body?.url ?? body?.user?.avatarUrl ?? "";
      if (!newUrl) {
        throw new Error("سرور آدرس تصویر را برنگرداند");
      }

      setFormData((c) => ({ ...c, avatarUrl: newUrl }));
      setInitialData((c) => ({ ...c, avatarUrl: newUrl }));

      const merged = { ...user, avatarUrl: newUrl };
      localStorage.setItem("user", JSON.stringify(merged));
      updateUser(merged);

      setSuccess("تصویر پروفایل با موفقیت به‌روزرسانی شد.");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError(
        err instanceof Error ? err.message : "آپلود تصویر انجام نشد."
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = () => {
    if (!window.confirm("تصویر پروفایل حذف شود؟")) return;
    setFormData((c) => ({ ...c, avatarUrl: "" }));
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    setFormData(initialData);
    setError(null);
    setSuccess(null);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("خروج از حساب انجام نشد. دوباره تلاش کنید.");
      setLoggingOut(false);
    }
  };

  // ✅ FIX #6: safe back navigation
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Auto-dismiss success after 4s
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-app px-4 py-8 sm:px-6 lg:py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        <ProfilePageHeader
          onBack={handleBack}
          onLogout={handleLogout}
          loggingOut={loggingOut}
          hasChanges={hasChanges}
        />

        <ProfileFeedback
          error={error}
          success={success}
          onDismissError={() => setError(null)}
          onDismissSuccess={() => setSuccess(null)}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <ProfileSummaryCard
            formData={formData}
            userVerified={user.verified}
            uploadingAvatar={uploadingAvatar}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            onGoToVerify={() => router.push("/verify-email")}
          />

          <ProfileEditForm
            formData={formData}
            saving={saving}
            hasChanges={hasChanges}
            onChange={updateField}
            onReset={handleReset}
            onSubmit={handleSave}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <CalendarDays size={15} />
          <span>
            اطلاعات حساب خود را به‌روز نگه دارید تا تجربه بهتری داشته باشید.
          </span>
        </div>
      </div>
    </main>
  );
}