"use client";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useBot } from "@/lib/hooks/useBot";
import { useAuth } from "@/lib/hooks/useAuth";

export default function OnboardingPage() {
  const [active, setActive] = useState(0);
  const [botToken, setBotToken] = useState("");
  const { connectBot, loading } = useBot();
  const { checkAuth } = useAuth();

  const handleConnect = async () => {
    if (!botToken.trim()) {
      notifications.show({
        color: "red",
        message: "Please enter your bot token",
      });
      return;
    }

    try {
      await connectBot({ token: botToken.trim() });
      // Update auth state to reflect bot connection
      await checkAuth();
      // Move to completed step on success
      setActive(3);
    } catch (error) {
      // Error handling is done in the useBot hook
      console.error('Bot connection failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="inline-block w-8 h-8 rounded-full bg-[var(--brand-accent)]" />
            <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Flovo</h2>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
          <p className="text-gray-600 mt-2">Let&apos;s set up your AI sales assistant</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                active >= 0 ? "bg-[var(--brand-primary)] text-white" : "bg-gray-200 text-gray-600"
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${active >= 1 ? "bg-[var(--brand-primary)]" : "bg-gray-200"}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                active >= 1 ? "bg-[var(--brand-primary)] text-white" : "bg-gray-200 text-gray-600"
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${active >= 2 ? "bg-[var(--brand-primary)]" : "bg-gray-200"}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                active >= 2 ? "bg-[var(--brand-primary)] text-white" : "bg-gray-200 text-gray-600"
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          {active === 0 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[var(--brand-accent)] rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Flovo!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  I&apos;m your AI-powered sales assistant. I&apos;ll help you manage customer conversations, 
                  process orders, and grow your business through Telegram.
                </p>
              </div>
              <button
                onClick={() => setActive(1)}
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand-primary)] text-white font-medium rounded-lg hover:opacity-90 transition"
              >
                Let&apos;s get started
              </button>
            </div>
          )}

          {active === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Bot</h3>
                <p className="text-gray-600">
                  Let&apos;s create a Telegram bot that will serve as your AI assistant
                </p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Follow these steps:</h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium mt-0.5">1</span>
                      <span>Open Telegram and search for <strong>@BotFather</strong></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium mt-0.5">2</span>
                      <span>Send the command <code className="bg-gray-200 px-1 rounded">/newbot</code></span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium mt-0.5">3</span>
                      <span>Choose a name for your bot (e.g., &quot;MyStore Assistant&quot;)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium mt-0.5">4</span>
                      <span>Choose a username ending with &quot;bot&quot; (e.g., &quot;mystoreassistant_bot&quot;)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-medium mt-0.5">5</span>
                      <span>Copy the bot token that BotFather provides</span>
                    </li>
                  </ol>
                </div>

                <div className="text-center">
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <span className="mr-2">📱</span>
                    Open @BotFather
                  </a>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setActive(0)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActive(2)}
                    className="flex-1 px-6 py-3 bg-[var(--brand-primary)] text-white font-medium rounded-lg hover:opacity-90 transition"
                  >
                    I have my token
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Bot</h3>
                <p className="text-gray-600">
                  Enter your Telegram bot token to connect your assistant
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Token
                  </label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent font-mono text-sm"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste the token you received from @BotFather
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setActive(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={loading || !botToken.trim()}
                    className="flex-1 px-6 py-3 bg-[var(--brand-primary)] text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Connecting..." : "Connect Bot"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">All Set!</h3>
                <p className="text-gray-600">
                  Your bot has been connected successfully. Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
