"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit2, Users, Ticket, TrendingUpDown, LogOut, Menu, X, CheckSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const adminLinks = [
  { href: '/admin', icon: TrendingUpDown, label: 'داشبورد' },
  { href: '/admin/users', icon: Users, label: 'مدیریت کاربران' },
  { href: '/admin/tickets', icon: Ticket, label: 'مدیریت تیکت‌ها' },
  { href: '/admin/tasks', icon: CheckSquare, label: 'مدیریت تسک‌ها' },
  { href: '/admin/stocks', icon: FolderGit2, label: 'مدیریت سهام' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Check if user is admin
  if (!user || !user.is_admin) {
    return (
      <div className="min-h-full flex items-center justify-center bg-app">
        <div className="text-center p-8 bg-card rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4 text-red-500">دسترسی غیرمجاز</h1>
          <p className="text-fg-subtle mb-6">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 right-0 z-50 p-4 bg-card border-b">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-40 h-full w-64 bg-card border-l
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-auto
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center space-x-2 space-x-reverse">
            <FolderGit2 className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">مدیریت</h1>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
                `}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 space-x-reverse w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Main content */}
      <div className="p-6 lg:p-10 pt-20 lg:pt-10">
        {children}
      </div>
    </div>
  );
}
