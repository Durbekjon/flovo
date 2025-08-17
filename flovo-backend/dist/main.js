"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const index_module_1 = require("./index.module");
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const helmet_1 = __importDefault(require("helmet"));
const global_exception_filter_1 = require("./core/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(index_module_1.IndexModule, {
        logger: ['error', 'warn', 'log'],
    });
    app.use((0, helmet_1.default)());
    app.use((req, res, next) => {
        const requestId = req.headers['x-request-id'] || require('uuid').v4();
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);
        next();
    });
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()) || ['http://localhost:3000', 'https://924c9d04ac33.ngrok-free.app'];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map