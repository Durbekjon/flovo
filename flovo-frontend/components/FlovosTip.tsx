"use client";

import { IconArrowRight, IconBulb, IconSparkles, IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import Link from 'next/link';

interface FlovosTipProps {
  hasBot: boolean;
  botEnabled?: boolean;
  totalOrders: number;
  last7DaysOrders: number;
  pendingOrders: number;
}

export function FlovosTip({ 
  hasBot, 
  botEnabled, 
  totalOrders, 
  last7DaysOrders, 
  pendingOrders 
}: FlovosTipProps) {
  const tip = useMemo(() => {
    if (!hasBot) {
      return {
        icon: "🤖",
        title: "Connect Your Bot",
        message: "Connect your Telegram bot token to start receiving and managing customer conversations.",
        action: "Connect your bot",
        actionLink: "/onboarding",
        color: "blue",
        priority: "high",
        gradient: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      };
    }

    if (!botEnabled) {
      return {
        icon: "▶️",
        title: "Start Your Bot",
        message: "Your bot is currently stopped. Start it to begin processing customer messages and orders!",
        action: "Start your bot",
        actionLink: "#",
        color: "yellow",
        priority: "high",
        gradient: "from-amber-500 to-orange-600",
        bg: "bg-amber-50",
        border: "border-amber-200"
      };
    }

    if (totalOrders === 0) {
      return {
        icon: "📦",
        title: "Ready for Orders",
        message: "Your bot is active! Add products to your inventory so your AI can sell them to customers.",
        action: "Manage Products",
        actionLink: "/dashboard/products",
        color: "green",
        priority: "medium",
        gradient: "from-emerald-500 to-teal-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200"
      };
    }

    if (pendingOrders > 0) {
      return {
        icon: "⏰",
        title: "Orders Need Attention",
        message: `You have ${pendingOrders} pending order${pendingOrders > 1 ? 's' : ''} that need your attention. Review and update their status.`,
        action: "View Orders",
        actionLink: "/dashboard/orders",
        color: "orange",
        priority: "high",
        gradient: "from-orange-500 to-red-600",
        bg: "bg-orange-50",
        border: "border-orange-200"
      };
    }

    if (last7DaysOrders === 0) {
      return {
        icon: "📈",
        title: "Boost Your Sales",
        message: "No orders this week. Consider adding more products or promoting your bot to increase sales.",
        action: "Add Products",
        actionLink: "/dashboard/products",
        color: "blue",
        priority: "medium",
        gradient: "from-blue-500 to-purple-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      };
    }

    return {
      icon: "🎉",
      title: "Great Job!",
      message: `You've received ${last7DaysOrders} order${last7DaysOrders > 1 ? 's' : ''} this week. Keep up the excellent work!`,
      action: "View Analytics",
      actionLink: "/dashboard/orders",
      color: "green",
      priority: "low",
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    };
  }, [hasBot, botEnabled, totalOrders, last7DaysOrders, pendingOrders]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <IconAlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <IconTrendingUp className="w-4 h-4 text-amber-500" />;
      // case 'low':
      //   return <IconCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <IconBulb className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tip.gradient} opacity-5`} />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${tip.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <IconSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Flovo's Tip</h3>
              <p className="text-sm text-gray-500">AI-powered insights</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${tip.bg} ${tip.border}`}>
            {getPriorityIcon(tip.priority)}
            <span className={`capitalize ${
              tip.priority === 'high' ? 'text-red-700' : 
              tip.priority === 'medium' ? 'text-amber-700' : 'text-green-700'
            }`}>
              {tip.priority} priority
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-4xl mb-4">
            {tip.icon}
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {tip.title}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {tip.message}
            </p>
          </div>

          {/* Action Button */}
          {tip.actionLink !== "#" && (
            <Link href={tip.actionLink}>
              <button className={`w-full mt-6 px-6 py-3 bg-gradient-to-r ${tip.gradient} text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2`}>
                {tip.action}
                <IconArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>

        {/* Decorative elements */}
        <div className={`absolute top-0 right-0 w-20 h-20 ${tip.bg} rounded-full opacity-20 -translate-y-10 translate-x-10`} />
        <div className={`absolute bottom-0 left-0 w-16 h-16 ${tip.bg} rounded-full opacity-20 translate-y-8 -translate-x-8`} />
      </div>
    </div>
  );
}
