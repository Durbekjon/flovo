export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}
export declare class RetryService {
    private readonly logger;
    executeWithRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    private sleep;
}
