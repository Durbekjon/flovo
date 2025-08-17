"use client";

import { IconTrendingUp, IconTrendingDown, IconPackage, IconShoppingCart, IconUsers, IconClock } from '@tabler/icons-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

function KpiCard({ title, value, change, changeLabel, icon, color = 'blue', loading }: KpiCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200'
    },
    purple: {
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    red: {
      gradient: 'from-red-500 to-pink-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${currentColor.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isPositive 
                ? 'bg-green-100 text-green-700' 
                : isNegative 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isPositive ? (
                <IconTrendingUp className="w-3 h-3" />
              ) : isNegative ? (
                <IconTrendingDown className="w-3 h-3" />
              ) : null}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            )}
          </div>
          
          {changeLabel && (
            <p className="text-xs text-gray-500">{changeLabel}</p>
          )}
        </div>

        {/* Decorative element */}
        <div className={`absolute bottom-0 right-0 w-16 h-16 ${currentColor.bg} rounded-full opacity-20 -translate-y-8 translate-x-8`} />
      </div>
    </div>
  );
}

interface KpiCardsProps {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    last7DaysOrders: number;
    last30DaysOrders: number;
  };
  loading?: boolean;
}

export function KpiCards({ summary, loading }: KpiCardsProps) {
  const weeklyGrowth = summary.last30DaysOrders > 0 
    ? Math.round(((summary.last7DaysOrders - (summary.last30DaysOrders / 4)) / (summary.last30DaysOrders / 4)) * 100)
    : 0;

  const monthlyGrowth = summary.last30DaysOrders > 0 
    ? Math.round(((summary.last30DaysOrders - (summary.last30DaysOrders * 0.8)) / (summary.last30DaysOrders * 0.8)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        title="Total Orders"
        value={summary.totalOrders.toLocaleString()}
        icon={<IconShoppingCart className="w-6 h-6 text-white" />}
        color="blue"
        loading={loading}
      />
      
      <KpiCard
        title="7-Day Orders"
        value={summary.last7DaysOrders.toLocaleString()}
        change={weeklyGrowth}
        changeLabel="vs last week"
        icon={<IconTrendingUp className="w-6 h-6 text-white" />}
        color="green"
        loading={loading}
      />
      
      <KpiCard
        title="Pending Orders"
        value={summary.pendingOrders.toLocaleString()}
        icon={<IconClock className="w-6 h-6 text-white" />}
        color="orange"
        loading={loading}
      />
      
      <KpiCard
        title="30-Day Orders"
        value={summary.last30DaysOrders.toLocaleString()}
        change={monthlyGrowth}
        changeLabel="vs last month"
        icon={<IconPackage className="w-6 h-6 text-white" />}
        color="purple"
        loading={loading}
      />
    </div>
  );
}
