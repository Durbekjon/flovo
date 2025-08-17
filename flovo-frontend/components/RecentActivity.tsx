"use client";

import { IconPackage, IconShoppingCart, IconUser, IconClock, IconCheck, IconTruck, IconX, IconActivity } from '@tabler/icons-react';

interface RecentActivityProps {
  orders?: Array<{
    id: number;
    status: string;
    customerName?: string;
    createdAt: string;
    details: any;
  }>;
  loading?: boolean;
}

export function RecentActivity({ orders, loading }: RecentActivityProps) {
  const recentOrders = orders?.slice(0, 5) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <IconClock className="w-4 h-4" />,
          label: 'Pending'
        };
      case 'CONFIRMED':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <IconCheck className="w-4 h-4" />,
          label: 'Confirmed'
        };
      case 'SHIPPED':
        return {
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: <IconTruck className="w-4 h-4" />,
          label: 'Shipped'
        };
      case 'DELIVERED':
        return {
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: <IconPackage className="w-4 h-4" />,
          label: 'Delivered'
        };
      case 'CANCELLED':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <IconX className="w-4 h-4" />,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: <IconPackage className="w-4 h-4" />,
          label: status
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconActivity className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
        <p className="text-gray-500 text-sm">
          Orders will appear here once customers start placing them
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentOrders.map((order, index) => {
        const details = order.details as any;
        const items = details?.items || 'Unknown Product';
        const statusConfig = getStatusConfig(order.status);
        
        return (
          <div key={order.id} className="group relative">
            {/* Timeline line */}
            {index < recentOrders.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-200 group-hover:bg-gray-300 transition-colors" />
            )}
            
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-gray-200">
              {/* Status icon */}
              <div className={`w-10 h-10 ${statusConfig.bg} ${statusConfig.border} rounded-full flex items-center justify-center ${statusConfig.color} flex-shrink-0`}>
                {statusConfig.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Order #{order.id}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                  {items}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {order.customerName && (
                    <div className="flex items-center gap-1">
                      <IconUser className="w-3 h-3" />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                  <span>{formatTimeAgo(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* View all button */}
      {recentOrders.length > 0 && (
        <div className="pt-4">
          <a 
            href="/dashboard/orders"
            className="block w-full text-center px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            View all orders →
          </a>
        </div>
      )}
    </div>
  );
}
