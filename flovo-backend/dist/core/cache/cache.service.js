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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CacheService = CacheService_1 = class CacheService {
    configService;
    logger = new common_1.Logger(CacheService_1.name);
    cache = new Map();
    defaultTTL = 5 * 60 * 1000;
    constructor(configService) {
        this.configService = configService;
        setInterval(() => this.cleanup(), 60 * 1000);
    }
    async get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttl) {
        const item = {
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        };
        this.cache.set(key, item);
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async invalidatePattern(pattern) {
        const keys = Array.from(this.cache.keys());
        const regex = new RegExp(pattern);
        for (const key of keys) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach((key) => this.cache.delete(key));
        if (keysToDelete.length > 0) {
            this.logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
    getDashboardSummaryKey(userId) {
        return `dashboard:summary:${userId}`;
    }
    getUserOrdersKey(userId, page, limit) {
        return `orders:user:${userId}:page:${page}:limit:${limit}`;
    }
    getProductKey(productId) {
        return `product:${productId}`;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map