import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { CreateBotDto } from './dto/connect-bot.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly encryptionService;
    private readonly logger;
    constructor(prisma: PrismaService, encryptionService: EncryptionService);
    connectBot(userId: number, createBotDto: CreateBotDto): Promise<{
        token: string;
        id: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
    }>;
    getBotByUserId(userId: number): Promise<{
        token: string;
        id: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
    } | null>;
    getBotByToken(token: string): Promise<{
        token: string;
        id: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
    } | null>;
    updateBotStatus(userId: number, isEnabled: boolean): Promise<{
        token: string;
        id: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        isEnabled: boolean;
    }>;
}
