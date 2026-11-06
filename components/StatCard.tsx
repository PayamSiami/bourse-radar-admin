import { TrendingUp } from "lucide-react";

export const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
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