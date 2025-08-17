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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const cache_service_1 = require("../../core/cache/cache.service");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    cacheService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, cacheService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
    }
    async createOrder(userId, createOrderDto) {
        this.logger.log(`Creating order for user ${userId}`);
        const order = await this.prisma.order.create({
            data: {
                userId,
                customerName: createOrderDto.customerName,
                customerContact: createOrderDto.customerContact,
                customerAddress: createOrderDto.customerAddress,
                details: createOrderDto.details,
                status: 'PENDING',
            },
        });
        await this.cacheService.invalidatePattern(`dashboard:summary:${userId}`);
        await this.cacheService.invalidatePattern(`orders:user:${userId}:*`);
        this.logger.log(`Order created with ID: ${order.id}`);
        return order;
    }
    async createOrderFromIntent(userId, orderData) {
        this.logger.log(`Creating order from AI intent for user ${userId}:`, orderData);
        const createOrderDto = {
            customerName: orderData.customerName !== 'Not provided'
                ? orderData.customerName
                : undefined,
            customerContact: orderData.customerContact !== 'Not provided'
                ? orderData.customerContact
                : undefined,
            customerAddress: orderData.customerAddress !== 'Not provided'
                ? orderData.customerAddress
                : undefined,
            details: {
                items: orderData.items,
                notes: orderData.notes,
                source: 'telegram_chat',
                aiGenerated: true,
                originalData: orderData,
            },
        };
        return this.createOrder(userId, createOrderDto);
    }
    async getOrdersByUser(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrdersByCustomerContact(contact) {
        return this.prisma.order.findMany({
            where: {
                customerContact: {
                    contains: contact,
                    mode: 'insensitive',
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrdersWithPagination(userId, page = 1, limit = 10) {
        const cacheKey = this.cacheService.getUserOrdersKey(userId, page, limit);
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({
                where: { userId },
            }),
        ]);
        const result = { orders, total };
        await this.cacheService.set(cacheKey, result, 2 * 60 * 1000);
        return result;
    }
    async getDashboardSummary(userId) {
        const cacheKey = this.cacheService.getDashboardSummaryKey(userId);
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [totalOrders, statusCounts, last7DaysOrders, last30DaysOrders, ordersWithPrices, topProductsData,] = await Promise.all([
            this.prisma.order.count({ where: { userId } }),
            this.prisma.order.groupBy({
                by: ['status'],
                where: { userId },
                _count: { status: true },
            }),
            this.prisma.order.count({
                where: {
                    userId,
                    createdAt: { gte: sevenDaysAgo },
                },
            }),
            this.prisma.order.count({
                where: {
                    userId,
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
            this.prisma.order.findMany({
                where: {
                    userId,
                    details: {
                        path: ['price'],
                        not: 'null',
                    },
                },
                select: {
                    details: true,
                },
            }),
            this.prisma.order.findMany({
                where: { userId },
                select: {
                    details: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 100,
            }),
        ]);
        const statusMap = new Map(statusCounts.map(({ status, _count }) => [status, _count.status]));
        const pendingOrders = statusMap.get('PENDING') || 0;
        const confirmedOrders = statusMap.get('CONFIRMED') || 0;
        const shippedOrders = statusMap.get('SHIPPED') || 0;
        const deliveredOrders = statusMap.get('DELIVERED') || 0;
        const cancelledOrders = statusMap.get('CANCELLED') || 0;
        let averageOrderValue;
        if (ordersWithPrices.length > 0) {
            const totalValue = ordersWithPrices.reduce((sum, order) => {
                const details = order.details;
                return sum + (details?.price || details?.total || 0);
            }, 0);
            averageOrderValue = totalValue / ordersWithPrices.length;
        }
        const productCounts = {};
        topProductsData.forEach((order) => {
            const details = order.details;
            const items = details?.items || 'Unknown Product';
            productCounts[items] = (productCounts[items] || 0) + 1;
        });
        const topProducts = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        const result = {
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            last7DaysOrders,
            last30DaysOrders,
            averageOrderValue,
            topProducts,
        };
        await this.cacheService.set(cacheKey, result, 5 * 60 * 1000);
        return result;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_service_1.CacheService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map