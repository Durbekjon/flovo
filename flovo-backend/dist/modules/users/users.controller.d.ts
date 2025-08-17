import { UsersService } from './users.service';
import { ConnectBotDto } from './dto/connect-bot.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    connectBot(user: JwtPayload, dto: ConnectBotDto): Promise<{
        success: boolean;
        bot: {
            id: number;
            isEnabled: boolean;
        };
    }>;
    getBot(user: JwtPayload): Promise<{
        bot: {
            id: number;
            isEnabled: boolean;
        } | null;
    }>;
    toggleBot(user: JwtPayload): Promise<{
        success: boolean;
        bot: {
            id: number;
            isEnabled: boolean;
        };
    }>;
    startBot(user: JwtPayload): Promise<{
        success: boolean;
        bot: {
            id: number;
            isEnabled: boolean;
        };
    }>;
    stopBot(user: JwtPayload): Promise<{
        success: boolean;
        bot: {
            id: number;
            isEnabled: boolean;
        };
    }>;
}
