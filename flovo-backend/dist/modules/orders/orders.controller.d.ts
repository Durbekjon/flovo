import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
interface RequestWithUser extends Request {
    user: JwtPayload;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: RequestWithUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        customerName: string | null;
        customerContact: string | null;
        customerAddress: string | null;
        details: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
    findAll(req: RequestWithUser, page?: string, limit?: string): Promise<{
        orders: import("@prisma/client").Order[];
        total: number;
    }>;
    getDashboardSummary(req: RequestWithUser): Promise<{
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
export {};
