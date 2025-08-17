import { NestFactory } from '@nestjs/core';
import { IndexModule } from './index.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(IndexModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security middleware
  app.use(helmet());

  // Request ID middleware
  app.use((req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || require('uuid').v4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) =>
    s.trim(),
  ) || ['http://localhost:3000', 'https://68e26a89caeb.ngrok-free.app'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}
bootstrap();
