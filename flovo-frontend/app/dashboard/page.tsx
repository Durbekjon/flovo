"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useBot } from "@/lib/hooks/useBot";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useOrders } from "@/lib/hooks/useOrders";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiCards } from "@/components/KpiCards";
import { OrdersChart } from "@/components/OrdersChart";
import { FlovosTip } from "@/components/FlovosTip";
import { TopProducts } from "@/components/TopProducts";
import { RecentActivity } from "@/components/RecentActivity";
import { useEffect } from "react";
import { IconTrendingUp, IconTrendingDown, IconRobot, IconPlayerPlay, IconPlayerStop, IconRefresh } from '@tabler/icons-react';

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth();
  const { bot, getBot, hasBot, initialized, startBot, stopBot, loading: botLoading } = useBot();
  const { summary, loading: summaryLoading } = useDashboard();
  const { orders, loading: ordersLoading } = useOrders();

  useEffect(() => {
    if (!authLoading && !initialized) {
      getBot();
    }
  }, [authLoading, initialized, getBot]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weeklyGrowth = summary?.last30DaysOrders && summary.last30DaysOrders > 0 
    ? Math.round(((summary.last7DaysOrders - (summary.last30DaysOrders / 4)) / (summary.last30DaysOrders / 4)) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 opacity-5 rounded-3xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Business Overview 📊
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Here's what's happening with your business today. Your AI assistant is working hard to help you grow.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {weeklyGrowth >= 0 ? (
                      <IconTrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <IconTrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth}% this week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards 
          summary={summary || {
            totalOrders: 0,
            pendingOrders: 0,
            last7DaysOrders: 0,
            last30DaysOrders: 0
          }}
          loading={summaryLoading}
        />

        {/* Bot Control Section */}
        {hasBot && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-50 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <IconRobot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">AI Assistant Control</h3>
                    <p className="text-gray-600">Manage your automated customer service</p>
                  </div>
                </div>
                <button
                  onClick={() => getBot()}
                  disabled={botLoading}
                  className="p-3 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  title="Refresh bot status"
                >
                  <IconRefresh className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-4 h-4 rounded-full ${bot?.isEnabled ? "bg-emerald-500" : "bg-red-500"} shadow-lg`} />
                <span className="text-lg font-semibold text-gray-800">
                  {bot?.isEnabled ? "🟢 Active & Processing" : "🔴 Stopped"}
                </span>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                {bot?.isEnabled
                  ? "Your AI assistant is actively engaging with customers, processing orders, and helping grow your business 24/7."
                  : "Your AI assistant is currently paused. Start it to begin automatically processing customer messages and orders."}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => bot?.isEnabled ? stopBot() : startBot()}
                  disabled={botLoading}
                  className={`px-6 py-3 rounded-xl text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    bot?.isEnabled
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  }`}
                >
                  {botLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : bot?.isEnabled ? (
                    <IconPlayerStop className="w-4 h-4" />
                  ) : (
                    <IconPlayerPlay className="w-4 h-4" />
                  )}
                  {botLoading ? "Processing..." : bot?.isEnabled ? "Stop Assistant" : "Start Assistant"}
                </button>
                
                <a
                  href="/dashboard/products"
                  className="px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Manage Products
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Orders Chart */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Order Analytics</h3>
                <p className="text-gray-600 mt-1">Track your order performance over time</p>
              </div>
              <div className="p-6">
                <OrdersChart summary={summary || {
                  totalOrders: 0,
                  pendingOrders: 0,
                  confirmedOrders: 0,
                  shippedOrders: 0,
                  deliveredOrders: 0,
                  cancelledOrders: 0,
                  last7DaysOrders: 0,
                  last30DaysOrders: 0
                }} />
              </div>
            </div>
          </div>

          {/* Flovo's Tip */}
          <div className="xl:col-span-2">
            <FlovosTip 
              hasBot={hasBot}
              botEnabled={bot?.isEnabled}
              totalOrders={summary?.totalOrders || 0}
              last7DaysOrders={summary?.last7DaysOrders || 0}
              pendingOrders={summary?.pendingOrders || 0}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <p className="text-gray-600 mt-1">Latest orders and updates</p>
            </div>
            <div className="p-6">
              <RecentActivity 
                orders={orders}
                loading={ordersLoading}
              />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
              <p className="text-gray-600 mt-1">Your best performing items</p>
            </div>
            <div className="p-6">
              {summary?.topProducts && summary.topProducts.length > 0 ? (
                <TopProducts topProducts={summary.topProducts} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconTrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No product data available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
