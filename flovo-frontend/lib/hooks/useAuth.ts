import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { AuthService, type TelegramLoginData } from '../services/auth.service';
import { UsersService } from '../services/users.service';

export interface AuthUser {
  userId: number;
  isAuthenticated: boolean;
  hasBot: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = async (data: TelegramLoginData): Promise<void> => {
    try {
      const response = await AuthService.login(data);
      localStorage.setItem('flovo_token', response.token);
      
      // Get user profile after login
      const profile = await AuthService.getProfile();
      
      // Check if user has a bot connected
      const botResponse = await UsersService.getBot();
      const hasBot = !!botResponse.bot;
      
      setUser({
        userId: profile.userId,
        isAuthenticated: true,
        hasBot,
      });
      
      notifications.show({
        color: 'green',
        message: 'Successfully logged in!',
      });
      
      // Redirect based on bot status
      if (hasBot) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error: any) {
      notifications.show({
        color: 'red',
        title: 'Login failed',
        message: error?.message ?? 'Unable to login. Please try again.',
      });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('flovo_token');
    setUser(null);
    router.push('/login');
  };

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('flovo_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await AuthService.getProfile();
      
      // Check if user has a bot connected
      const botResponse = await UsersService.getBot();
      const hasBot = !!botResponse.bot;
      
      setUser({
        userId: profile.userId,
        isAuthenticated: true,
        hasBot,
      });
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('flovo_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user?.isAuthenticated,
  };
}
