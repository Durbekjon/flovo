import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { UsersService, type ConnectBotRequest } from '../services/users.service';

export interface BotInfo {
  id: number;
  isEnabled: boolean;
}

export function useBot() {
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const connectBot = async (data: ConnectBotRequest): Promise<void> => {
    setLoading(true);
    try {
      const response = await UsersService.connectBot(data);
      
      setBot(response.bot);
      
      notifications.show({
        color: 'green',
        title: 'Success! 🎉',
        message: 'Your bot has been connected successfully',
      });
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Connection failed',
        message: error instanceof Error ? error.message : 'Failed to connect bot. Please check your token.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBot = useCallback(async (): Promise<void> => {
    if (initialized) return; // Prevent multiple calls
    
    setLoading(true);
    setInitialized(true);
    try {
      const response = await UsersService.getBot();
      setBot(response.bot);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to load bot information',
      });
      setInitialized(false); // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  const refreshBot = useCallback(async (): Promise<void> => {
    setInitialized(false);
    await getBot();
  }, [getBot]);

  const startBot = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await UsersService.startBot();
      setBot(response.bot);
      notifications.show({
        color: 'green',
        title: 'Bot Started! 🚀',
        message: 'Your bot is now active and webhook has been set.',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to start bot',
        message: error instanceof Error ? error.message : 'Unable to start bot. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const stopBot = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await UsersService.stopBot();
      setBot(response.bot);
      notifications.show({
        color: 'orange',
        title: 'Bot Stopped ⏸️',
        message: 'Your bot is now inactive and webhook has been removed.',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to stop bot',
        message: error instanceof Error ? error.message : 'Unable to stop bot. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBot = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await UsersService.toggleBot();
      setBot(response.bot);
      notifications.show({
        color: response.bot.isEnabled ? 'green' : 'orange',
        title: response.bot.isEnabled ? 'Bot Started! 🚀' : 'Bot Stopped ⏸️',
        message: response.bot.isEnabled 
          ? 'Your bot is now active and webhook has been set.' 
          : 'Your bot is now inactive and webhook has been removed.',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to toggle bot',
        message: error instanceof Error ? error.message : 'Unable to toggle bot. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    bot,
    loading,
    initialized,
    connectBot,
    getBot,
    refreshBot,
    startBot,
    stopBot,
    toggleBot,
    hasBot: !!bot,
  };
}
