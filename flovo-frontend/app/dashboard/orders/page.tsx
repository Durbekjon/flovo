"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useOrders } from "@/lib/hooks/useOrders";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IconRefresh, IconShoppingCart, IconPackage, IconTruck, IconCheck, IconX, IconClock, IconUser, IconPhone, IconCalendar } from '@tabler/icons-react';

export default function OrdersPage() {
  const { loading: authLoading } = useRequireAuth();
  const { orders, loading, refreshOrders } = useOrders();
  
  console.log('Orders page - orders:', orders, 'loading:', loading);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-800 opacity-5 rounded-3xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Order Management 📦
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Track and manage all your customer orders in one place. Keep your customers informed about their order status.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconShoppingCart className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">{orders?.length || 0} total orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <IconShoppingCart className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {orders?.length || 0} Orders
              </span>
            </div>
          </div>
          
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IconRefresh className="w-4 h-4" />
            )}
            {loading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {/* Orders Content */}
        {!orders || orders.length === 0 ? (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-12 shadow-lg">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <IconShoppingCart className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                    Your orders will appear here once customers start chatting with your AI assistant and making purchases.
                  </p>
                </div>
                <button
                  onClick={refreshOrders}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Refreshing..." : "Refresh Orders"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 mt-1">Manage and track your customer orders</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const details = order.details as any;
                    const items = details?.items || 'Unknown Product';
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                              <IconPackage className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Order #{order.id}
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-1">
                                {items}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <IconUser className="w-4 h-4 text-gray-400" />
                              <span>{order.customerName || 'Anonymous'}</span>
                            </div>
                            {order.customerContact && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <IconPhone className="w-4 h-4 text-gray-400" />
                                <span>{order.customerContact}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <IconCalendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
