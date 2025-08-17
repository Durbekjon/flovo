"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../core/prisma/prisma.service");
let AuthService = class AuthService {
    jwtService;
    configService;
    prisma;
    constructor(jwtService, configService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async validateTelegramLogin(payload) {
        const { hash, ...rest } = payload;
        const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new common_1.UnauthorizedException('Telegram bot token not configured');
        }
        const secret = crypto.createHash('sha256').update(botToken).digest();
        const canonicalData = {};
        for (const [key, value] of Object.entries(rest)) {
            if (key === 'hash')
                continue;
            if (value === undefined || value === null)
                continue;
            if (typeof value === 'string' || typeof value === 'number') {
                canonicalData[key] = value;
            }
        }
        const dataCheckString = Object.keys(canonicalData)
            .sort()
            .map((key) => `${key}=${canonicalData[key]}`)
            .join('\n');
        const hmac = crypto
            .createHmac('sha256', secret)
            .update(dataCheckString)
            .digest('hex');
        if (hmac !== hash) {
            throw new common_1.UnauthorizedException('Invalid Telegram signature');
        }
        const telegramId = BigInt(payload.id);
        const user = await this.prisma.user.upsert({
            where: { telegramId },
            update: {
                telegramUsername: payload.username ?? null,
                firstName: payload.first_name ?? null,
                lastName: payload.last_name ?? null,
            },
            create: {
                telegramId,
                telegramUsername: payload.username ?? null,
                firstName: payload.first_name ?? null,
                lastName: payload.last_name ?? null,
            },
        });
        const userId = user.id;
        const token = await this.jwtService.signAsync({ userId });
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map