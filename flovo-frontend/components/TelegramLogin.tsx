"use client";

import { useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/lib/hooks/useAuth";
import type { TelegramLoginData } from "@/lib/services/auth.service";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginData) => void;
  }
}

export function TelegramLogin() {
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
    if (!botName) {
      notifications.show({
        color: "red",
        title: "Telegram bot missing",
        message: "Set NEXT_PUBLIC_TELEGRAM_BOT_NAME in your frontend env",
      });
      return;
    }

    window.onTelegramAuth = async (user: TelegramLoginData) => {
      try {
        await login(user);
      } catch (error) {
        // Error handling is done in the useAuth hook
        console.error('Login failed:', error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
      setReady(true);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      delete window.onTelegramAuth;
    };
  }, [login]);

  return (
    <div ref={containerRef} aria-busy={!ready} style={{ minHeight: 54, display: "inline-block" }} />
  );
}


