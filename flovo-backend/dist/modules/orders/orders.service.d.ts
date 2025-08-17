import { PrismaService } from '../../core/prisma/prisma.service';
import { CacheService } from '../../core/cache/cache.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { Order } from '@prisma/client';
export declare class OrdersService {
    private readonly prisma;
    private readonly cacheService;
    private readonly logger;
    constructor(prisma: PrismaService, cacheService: CacheService);
    createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order>;
    createOrderFromIntent(userId: number, orderData: any): Promise<Order>;
    getOrdersByUser(userId: number): Promise<Order[]>;
    getOrdersByCustomerContact(contact: string): Promise<Order[]>;
    getOrdersWithPagination(userId: number, page?: number, limit?: number): Promise<{
        orders: Order[];
        total: number;
    }>;
    getDashboardSummary(userId: number): Promise<{
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        last7DaysOrders: number;
        last30DaysOrders: number;
        averageOrderValue?: number;
        topProducts?: Array<{
            name: string;
            count: number;
        }>;
    }>;
}
