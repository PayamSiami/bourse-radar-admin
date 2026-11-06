"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim();

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر داشته باشد.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register(
        normalizedEmail,
        password,
        displayName.trim() || undefined
      );

      router.push("/verify-email?sent=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-app bg-[url('/images/login-background.webp')] bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-6 lg:py-14"
    >
      {/* Background overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/50 dark:bg-black/40"
      />

      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-7 flex flex-col items-center">
          <Link
            href="/"
            aria-label="صفحه اصلی بورس رادار"
            className="group mb-4 flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/25 transition-transform group-hover:scale-105">
              <TrendingUp size={25} strokeWidth={2.5} />
            </div>

            <span className="text-2xl font-extrabold tracking-tight text-fg">
              بورس <span className="text-brand-500">رادار</span>
            </span>
          </Link>

          <p className="text-center text-sm text-muted">
            همراه هوشمند شما در تحلیل بازار سرمایه
          </p>
        </div>

        {/* Register card */}
        <section className="rounded-3xl border border-app bg-surface/95 p-6 shadow-2xl shadow-black/8 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1 w-7 rounded-full bg-brand-500" />
              <span className="text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400">
                عضویت رایگان
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">
              به بورس کاو بپیوندید
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              حساب خود را بسازید و تحلیل بازار را هوشمندانه‌تر دنبال کنید.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p className="leading-6">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-semibold text-fg"
              >
                نام نمایشی
                <span className="mr-1 font-normal text-muted">
                  (اختیاری)
                </span>
              </label>

              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="نام شما"
                  disabled={loading}
                  maxLength={80}
                  className="h-12 w-full rounded-xl border-app bg-app pr-11 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-fg"
              >
                آدرس ایمیل
              </label>

              <div className="relative">
                <Mail
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-app bg-app pr-11 text-left transition focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-fg"
              >
                رمز عبور
              </label>

              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="حداقل ۸ کاراکتر"
                  minLength={8}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-app bg-app px-11 text-right transition focus-visible:ring-2 focus-visible:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "مخفی کردن رمز عبور"
                      : "نمایش رمز عبور"
                  }
                  aria-pressed={showPassword}
                  className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted">
                برای امنیت بیشتر، از رمز عبوری استفاده کنید که در سایت‌های دیگر ندارید.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                password.length < 8
              }
              className="flex h-12 w-full items-center justify-center rounded-xl border border-app bg-transparent px-4 text-sm font-semibold text-fg transition-colors hover:border-brand-500/50 hover:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  <span>در حال ساخت حساب...</span>
                </>
              ) : (
                <>
                  <span>ایجاد حساب کاربری</span>
                  <ArrowLeft size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-app" />
            <span className="text-xs text-muted">قبلاً عضو شده‌اید؟</span>
            <div className="h-px flex-1 bg-app" />
          </div>

          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-app bg-transparent px-4 text-sm font-semibold text-fg transition-colors hover:border-brand-500/50 hover:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            ورود به حساب کاربری
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <ShieldCheck
              size={16}
              className="shrink-0 text-brand-500"
            />
            <span>برای تکمیل ثبت‌نام، ایمیل خود را تأیید کنید.</span>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-muted">
          با ایجاد حساب، می‌توانید از امکانات بورس کاواستفاده کنید.
        </p>
      </div>
    </main>
  );
}
