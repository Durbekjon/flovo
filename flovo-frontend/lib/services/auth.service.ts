import { api } from '../api';

export interface TelegramLoginData {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  auth_date: number;
  hash: string;
  photo_url?: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  userId: number;
}

export class AuthService {
  static async login(data: TelegramLoginData): Promise<LoginResponse> {
    return api<LoginResponse>('/auth/telegram/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getProfile(): Promise<UserProfile> {
    return api<UserProfile>('/auth/telegram/me', {
      method: 'GET',
      auth: true,
    });
  }
}
