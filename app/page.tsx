"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import {
  CheckCircle,
  Ticket,
  Users,
  FolderGit2,
  TrendingUp,
  Activity,
  XCircle,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface DashboardStats {
  users?: { total?: number; newUsers?: number; verifiedUsers?: number; admins?: number };
  tickets?: { open?: number; pending?: number; resolved?: number; total?: number };
  stocks?: { total?: number; activeWithPrice?: number };
}

const faNum = (n?: number) =>
  (n ?? 0).toLocaleString("fa-IR");

function StatRow({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconClass: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Icon className={iconClass} size={18} />
        <span className="font-semibold tabular-nums">{faNum(value)}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      // TODO: replace with real endpoint, e.g. GET /admin/stats
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {...});
      // setStats(await res.json());
      setStats({});
    } catch (e: any) {
      setError(e?.message || "خطا در بارگذاری آمار");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <main className="min-h-screen bg-app text-fg">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 mt-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              داشبورد مدیریتی
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              نمای کلی وضعیت سیستم
            </p>
          </div>
          <button
            onClick={() => loadStats(true)}
            disabled={isRefreshing}
            className="
              inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
              border border-border bg-background text-sm font-medium
              hover:bg-muted transition-colors
              disabled:opacity-50 disabled:pointer-events-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "در حال بروزرسانی" : "بروزرسانی"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="کاربران کل"
            value={faNum(stats.users?.total)}
            subtext={`${faNum(stats.users?.newUsers)} کاربر جدید در این ماه`}
            icon={Users}
            trend={true}
            color="bg-blue-500"
          />
          <StatCard
            title="تیکت‌های باز"
            value={faNum(stats.tickets?.open)}
            subtext={`${faNum(stats.tickets?.pending)} در انتظار پاسخ`}
            icon={Ticket}
            trend={false}
            color="bg-yellow-500"
          />
          <StatCard
            title="سهام موجود"
            value={faNum(stats.stocks?.total)}
            subtext={`${faNum(stats.stocks?.activeWithPrice)} با قیمت فعال`}
            icon={FolderGit2}
            trend={true}
            color="bg-green-500"
          />
          <StatCard
            title="تیکت‌های حل‌شده"
            value={faNum(stats.tickets?.resolved)}
            subtext={`${faNum(stats.tickets?.total)} تیکت کل`}
            icon={CheckCircle}
            trend={true}
            color="bg-purple-500"
          />
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Users */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">آمار کاربران</h2>
              <Link
                href="/users"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                مشاهده
                <ArrowLeft size={14} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              <StatRow
                label="کاربران تأییدشده"
                value={stats.users?.verifiedUsers ?? 0}
                icon={CheckCircle}
                iconClass="text-green-500"
              />
              <StatRow
                label="مدیران"
                value={stats.users?.admins ?? 0}
                icon={TrendingUp}
                iconClass="text-blue-500"
              />
              <StatRow
                label="کاربران جدید (ماه جاری)"
                value={stats.users?.newUsers ?? 0}
                icon={Activity}
                iconClass="text-purple-500"
              />
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">آمار تیکت‌ها</h2>
              <Link
                href="/admin/tickets"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                مشاهده
                <ArrowLeft size={14} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              <StatRow
                label="باز"
                value={stats.tickets?.open ?? 0}
                icon={XCircle}
                iconClass="text-red-500"
              />
              <StatRow
                label="در انتظار"
                value={stats.tickets?.pending ?? 0}
                icon={Activity}
                iconClass="text-yellow-500"
              />
              <StatRow
                label="حل‌شده"
                value={stats.tickets?.resolved ?? 0}
                icon={CheckCircle}
                iconClass="text-green-500"
              />
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-semibold">جمع کل</span>
                <span className="font-bold text-lg tabular-nums">
                  {faNum(stats.tickets?.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
