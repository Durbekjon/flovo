"use client";

import { useMemo } from 'react';

interface OrdersChartProps {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    last7DaysOrders: number;
    last30DaysOrders: number;
  };
}

export function OrdersChart({ summary }: OrdersChartProps) {
  const chartData = useMemo(() => {
    const data = [
      { status: 'Pending', count: summary.pendingOrders, color: '#fbbf24' },
      { status: 'Confirmed', count: summary.confirmedOrders, color: '#3b82f6' },
      { status: 'Shipped', count: summary.shippedOrders, color: '#8b5cf6' },
      { status: 'Delivered', count: summary.deliveredOrders, color: '#10b981' },
      { status: 'Cancelled', count: summary.cancelledOrders, color: '#ef4444' },
    ].filter(item => item.count > 0);

    return data;
  }, [summary]);

  const maxCount = Math.max(...chartData.map(item => item.count), 1);

  if (chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
        <div className="text-center text-gray-500 py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p>No orders yet. Start receiving orders to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
      
      <div className="space-y-3">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {item.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${(item.count / maxCount) * 100}%`
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-right">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{summary.last7DaysOrders}</p>
            <p className="text-sm text-gray-600">Last 7 days</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{summary.last30DaysOrders}</p>
            <p className="text-sm text-gray-600">Last 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
