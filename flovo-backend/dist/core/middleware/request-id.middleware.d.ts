import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
interface RequestWithId extends Request {
    requestId: string;
}
export declare class RequestIdMiddleware implements NestMiddleware {
    use(req: RequestWithId, res: Response, next: NextFunction): void;
}
export {};
