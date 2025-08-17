"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { IconBrandTelegram, IconRobot, IconShoppingCart, IconTrendingUp, IconArrowRight, IconCheck, IconSparkles } from '@tabler/icons-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();



  useEffect(() => {
    localStorage.setItem('flovo_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1NTQwNTIyMiwiZXhwIjoxNzU2MDEwMDIyfQ.YJZMewMhzeK9m_HN4sg2eoZV8h42UcYwYasaHURzuY0')
    if (!loading && user?.isAuthenticated) {
      // Redirect authenticated users based on bot status
      if (user.hasBot) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading Flovo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <IconRobot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Flovo
            </span>
          </div>
          <a 
            href="/login" 
            className="px-6 py-2 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                AI-powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Telegram Sales
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Assistant
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Automate customer service, manage orders, and get sales insights — all through a friendly AI persona that works 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a 
                href="/login" 
                className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
              >
                <IconBrandTelegram className="w-6 h-6" />
                Start with Telegram
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#features"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200 flex items-center gap-3"
              >
                <IconSparkles className="w-5 h-5 text-indigo-500" />
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <IconRobot className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7 AI Assistant</h3>
                <p className="text-gray-600">Never miss a customer inquiry with our intelligent AI that works around the clock</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <IconShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Order Management</h3>
                <p className="text-gray-600">Automatically process orders, track inventory, and manage customer data</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <IconTrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sales Analytics</h3>
                <p className="text-gray-600">Get detailed insights into your sales performance and customer behavior</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Flovo?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your Telegram business with AI-powered automation that actually works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "Easy Setup",
                description: "Connect your Telegram bot in minutes with our simple onboarding process",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "Smart Conversations",
                description: "AI that understands context and provides helpful, personalized responses",
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "Order Automation",
                description: "Automatically process orders, send confirmations, and update inventory",
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "Customer Insights",
                description: "Track customer behavior and get actionable insights to grow your business",
                color: "from-orange-500 to-red-600"
              },
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "Multi-language Support",
                description: "Serve customers in their preferred language with automatic translation",
                color: "from-teal-500 to-cyan-600"
              },
              {
                icon: <IconCheck className="w-6 h-6" />,
                title: "24/7 Availability",
                description: "Never lose a sale with round-the-clock customer service automation",
                color: "from-indigo-500 to-purple-600"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-6 py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Flovo to automate their Telegram sales and customer service.
          </p>
          <a 
            href="/login" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <IconBrandTelegram className="w-6 h-6" />
            Get Started Free
            <IconArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <IconRobot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Flovo</span>
          </div>
          <p className="text-gray-400 mb-6">
            AI-powered Telegram sales assistant for modern businesses
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
