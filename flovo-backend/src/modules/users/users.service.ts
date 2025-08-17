import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { CreateBotDto } from './dto/connect-bot.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async connectBot(userId: number, createBotDto: CreateBotDto) {
    try {
      // Encrypt the bot token before saving
      const encryptedToken = await this.encryptionService.encrypt(
        createBotDto.token,
      );

      // Check if user already has a bot
      const existingBot = await this.prisma.bot.findUnique({
        where: { userId },
      });

      if (existingBot) {
        // Update existing bot
        return await this.prisma.bot.update({
          where: { userId },
          data: {
            token: encryptedToken,
            isEnabled: true,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new bot
        return await this.prisma.bot.create({
          data: {
            token: encryptedToken,
            userId,
            isEnabled: true,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to connect bot for user ${userId}:`, error);
      throw error;
    }
  }

  async getBotByUserId(userId: number) {
    try {
      const bot = await this.prisma.bot.findUnique({
        where: { userId },
      });

      if (!bot) {
        return null;
      }

      // Decrypt the token when retrieving
      const decryptedToken = await this.encryptionService.decrypt(bot.token);

      return {
        ...bot,
        token: decryptedToken, // Return decrypted token for API use
      };
    } catch (error) {
      this.logger.error(`Failed to get bot for user ${userId}:`, error);
      throw error;
    }
  }

  async getBotByToken(token: string) {
    try {
      // Since tokens are encrypted, we need to search differently
      // This is a simplified approach - in production, you might want to store a hash
      const bots = await this.prisma.bot.findMany();

      for (const bot of bots) {
        try {
          const decryptedToken = await this.encryptionService.decrypt(
            bot.token,
          );
          if (decryptedToken === token) {
            return {
              ...bot,
              token: decryptedToken,
            };
          }
        } catch (error) {
          // Skip if decryption fails
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get bot by token:', error);
      throw error;
    }
  }

  async updateBotStatus(userId: number, isEnabled: boolean) {
    try {
      return await this.prisma.bot.update({
        where: { userId },
        data: {
          isEnabled,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update bot status for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
