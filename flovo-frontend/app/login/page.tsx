"use client";

import { TelegramLogin } from "@/components/TelegramLogin";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { IconBrandTelegram, IconRobot, IconArrowLeft, IconShield, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
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
          <Link href="/" className="flex items-center gap-3 group">
            <IconArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            <span className="text-gray-600 group-hover:text-gray-800 transition-colors font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <IconRobot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Flovo
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 opacity-5 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-8 text-center border-b border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <IconBrandTelegram className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Flovo</h1>
                <p className="text-gray-600 text-lg">
                  Sign in with Telegram to access your AI-powered sales assistant
                </p>
              </div>

              {/* Login Form */}
              <div className="p-8">
                <div className="mb-8">
                  <TelegramLogin />
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <IconCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Secure authentication with Telegram</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <IconCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span>No password required</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                      <IconCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Instant access to your dashboard</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <IconShield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Secure & Private</p>
                      <p>We only access your Telegram username and basic profile information. Your messages and data remain private.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">New to Flovo?</h3>
              <p className="text-gray-600 mb-4">
                Create your AI sales assistant in minutes. No coding required.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Learn more about Flovo
                <IconArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}
