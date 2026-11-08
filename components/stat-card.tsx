"use client";

import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  FolderGit2,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  icon?: LucideIcon;
  color: string;
}

const colorStyles: Record<string, string> = {
  "bg-blue-500": "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
  "bg-yellow-500": "from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700",
  "bg-green-500": "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
  "bg-purple-500": "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
  "bg-red-500": "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
  "bg-gray-500": "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700",
};

export function StatCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon = Users,
  color = "bg-blue-500",
}: StatCardProps) {
  const display = typeof value === "number" ? value.toLocaleString("fa-IR") : value;
  const gradientClass = colorStyles[color] || colorStyles["bg-blue-500"];

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center ${gradientClass} shadow-lg group-hover:scale-105 transition-transform`}>
            <Icon className="text-white" size={24} />
          </div>

          {trend !== undefined && (
            <div className="flex items-center text-sm font-medium">
              {trend >= 0 ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <ArrowUpCircle size={16} className="ml-1" />
                  <span>{Math.abs(trend)}%</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <ArrowDownCircle size={16} className="ml-1" />
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {title}
        </h3>

        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{display}</span>
        </div>

        {subtext && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtext}</p>
        )}
      </div>

      <div className={`h-1.5 ${gradientClass} opacity-40`}></div>
    </div>
  );
}

export function DetailCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
