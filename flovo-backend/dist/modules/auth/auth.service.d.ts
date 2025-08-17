import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';
export interface TelegramAuthPayload {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    auth_date: number;
    hash: string;
    photo_url?: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    validateTelegramLogin(payload: TelegramLoginDto): Promise<string>;
}
