"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const connect_bot_dto_1 = require("./dto/connect-bot.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async connectBot(user, dto) {
        const bot = await this.usersService.connectBot(Number(user.userId), dto);
        return {
            success: true,
            bot: {
                id: bot.id,
                isEnabled: bot.isEnabled,
            },
        };
    }
    async getBot(user) {
        const result = await this.usersService.getBot(Number(user.userId));
        return {
            bot: result.bot
                ? { id: result.bot.id, isEnabled: result.bot.isEnabled }
                : null,
        };
    }
    async toggleBot(user) {
        const result = await this.usersService.toggleBotStatus(Number(user.userId));
        return {
            success: true,
            bot: {
                id: result.bot.id,
                isEnabled: result.bot.isEnabled,
            },
        };
    }
    async startBot(user) {
        const result = await this.usersService.setBotStatus(Number(user.userId), true);
        return {
            success: true,
            bot: {
                id: result.bot.id,
                isEnabled: result.bot.isEnabled,
            },
        };
    }
    async stopBot(user) {
        const result = await this.usersService.setBotStatus(Number(user.userId), false);
        return {
            success: true,
            bot: {
                id: result.bot.id,
                isEnabled: result.bot.isEnabled,
            },
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('bot'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, connect_bot_dto_1.ConnectBotDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "connectBot", null);
__decorate([
    (0, common_1.Get)('bot'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBot", null);
__decorate([
    (0, common_1.Put)('bot/toggle'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleBot", null);
__decorate([
    (0, common_1.Put)('bot/start'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "startBot", null);
__decorate([
    (0, common_1.Put)('bot/stop'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "stopBot", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map