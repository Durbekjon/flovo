import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class RateLimitGuard implements CanActivate {
    private reflector;
    private readonly requestCounts;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private getClientId;
}
