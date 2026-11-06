"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-app bg-[url('/images/login-background.webp')] bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-6 lg:py-14"
    >
      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-7 flex flex-col items-center">
          <Link
            href="/"
            aria-label="صفحه اصلی بورس رادار"
            className="group mb-5 flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20 transition-transform group-hover:scale-105">
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

        {/* Login card */}
        <section className="rounded-3xl border border-app bg-surface p-6 shadow-xl shadow-black/4 sm:p-8">
          <div className="mb-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400">
                حساب کاربری
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">
              خوش برگشتی!
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              برای دسترسی به حساب خود، اطلاعات ورود را وارد کنید.
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
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-fg"
                >
                  رمز عبور
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                  فراموشی رمز عبور؟
                </Link>
              </div>

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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-app bg-app px-11 text-right transition focus-visible:ring-2 focus-visible:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                  aria-pressed={showPassword}
                  className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-app bg-transparent px-4 text-sm font-semibold text-fg transition-colors hover:border-brand-500/50 hover:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود به حساب</span>
                  <ArrowLeft size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-app" />
            <span className="text-xs text-muted">هنوز عضو نیستید؟</span>
            <div className="h-px flex-1 bg-app" />
          </div>

          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-app bg-transparent px-4 text-sm font-semibold text-fg transition-colors hover:border-brand-500/50 hover:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            ساخت حساب کاربری جدید
          </Link>

          {/* Trust note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <ShieldCheck size={16} className="shrink-0 text-brand-500" />
            <span>اطلاعات حساب شما با دقت محافظت می‌شود.</span>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-muted">
          با ورود به بورس رادار، به صفحه حساب کاربری خود دسترسی پیدا می‌کنید.
        </p>
      </div>
    </main>
  );
}
