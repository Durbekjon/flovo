import { ConfigService } from '@nestjs/config';
export declare class CacheService {
    private readonly configService;
    private readonly logger;
    private readonly cache;
    private readonly defaultTTL;
    constructor(configService: ConfigService);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    private cleanup;
    getDashboardSummaryKey(userId: number): string;
    getUserOrdersKey(userId: number, page: number, limit: number): string;
    getProductKey(productId: number): string;
}
