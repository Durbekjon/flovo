import { api } from '../api';

export interface ConnectBotRequest {
  token: string;
}

export interface ConnectBotResponse {
  success: boolean;
  bot: {
    id: number;
    isEnabled: boolean;
  };
}

export interface GetBotResponse {
  bot: {
    id: number;
    isEnabled: boolean;
  } | null;
}

export interface BotControlResponse {
  success: boolean;
  bot: {
    id: number;
    isEnabled: boolean;
  };
}

export class UsersService {
  static async connectBot(data: ConnectBotRequest): Promise<ConnectBotResponse> {
    return api<ConnectBotResponse>('/users/bot', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    });
  }

  static async getBot(): Promise<GetBotResponse> {
    return api<GetBotResponse>('/users/bot', {
      method: 'GET',
      auth: true,
    });
  }

  static async startBot(): Promise<BotControlResponse> {
    return api<BotControlResponse>('/users/bot/start', {
      method: 'PUT',
      auth: true,
    });
  }

  static async stopBot(): Promise<BotControlResponse> {
    return api<BotControlResponse>('/users/bot/stop', {
      method: 'PUT',
      auth: true,
    });
  }

  static async toggleBot(): Promise<BotControlResponse> {
    return api<BotControlResponse>('/users/bot/toggle', {
      method: 'PUT',
      auth: true,
    });
  }
}
