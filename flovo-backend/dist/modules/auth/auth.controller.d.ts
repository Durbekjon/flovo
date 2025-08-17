import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: TelegramLoginDto): Promise<{
        token: string;
    }>;
    me(user: JwtPayload): JwtPayload;
}
