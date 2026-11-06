"use client";

import { useState, useEffect } from 'react';
import { Users, Ticket, FolderGit2, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface DashboardStats {
  users: {
    total: number;
    newUsers: number;
    admins: number;
    verifiedUsers: number;
  };
  tickets: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
  };
  stocks: {
    total: number;
    activeWithPrice: number;
  };
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت آمار');
      }

      const result = await response.json();
      setStats(result.data);
    } catch (error: any) {
      setError(error.message || 'خطایی در بارگذاری آمار رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">داشبورد مدیریتی</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-card rounded-lg shadow">
        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
    <div className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      {subtext && (
        <div className="flex items-center text-sm">
          {trend && (
            <TrendingUp className="text-green-500 mr-2" size={16} />
          )}
          <span className="text-gray-600 dark:text-gray-400">{subtext}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">داشبورد مدیریتی</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          به‌روزرسانی
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="کاربران کل"
          value={stats?.users.total || 0}
          subtext={`${stats?.users.newUsers || 0} کاربر جدید در این ماه`}
          icon={Users}
          trend={true}
          color="bg-blue-500"
        />

        <StatCard
          title="تیکت‌های باز"
          value={stats?.tickets.open || 0}
          subtext={`${stats?.tickets.pending || 0} در انتظار پاسخ`}
          icon={Ticket}
          trend={false}
          color="bg-yellow-500"
        />

        <StatCard
          title="سهام موجود"
          value={stats?.stocks.total || 0}
          subtext={`${stats?.stocks.activeWithPrice || 0} با قیمت فعال`}
          icon={FolderGit2}
          trend={true}
          color="bg-green-500"
        />

        <StatCard
          title="تیکت‌های حل‌شده"
          value={stats?.tickets.resolved || 0}
          subtext={`${stats?.tickets.total || 0} تیکت کل`}
          icon={CheckCircle}
          trend={true}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">آمار کاربران</h2>
            <Users className="text-blue-500" size={24} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">کاربران تأییدشده</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-semibold">{stats?.users.verifiedUsers || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">مدیران</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <TrendingUp className="text-blue-500" size={20} />
                <span className="font-semibold">{stats?.users.admins || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">کاربران جدید (ماه جاری)</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Activity className="text-purple-500" size={20} />
                <span className="font-semibold">{stats?.users.newUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">آمار تیکت‌ها</h2>
            <Ticket className="text-yellow-500" size={24} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">باز</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <XCircle className="text-red-500" size={20} />
                <span className="font-semibold">{stats?.tickets.open || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">در انتظار</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Activity className="text-yellow-500" size={20} />
                <span className="font-semibold">{stats?.tickets.pending || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">حل‌شده</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-semibold">{stats?.tickets.resolved || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">جمع کل</span>
              <span className="font-bold text-lg">{stats?.tickets.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
