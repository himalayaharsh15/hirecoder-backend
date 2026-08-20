import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ============================================================
  // CORS
  // ============================================================

  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // ============================================================
  // VALIDATION
  // ============================================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ============================================================
  // SWAGGER
  // ============================================================

  const config = new DocumentBuilder()
    .setTitle('HireCoder API')
    .setDescription(
      'HireCoder Backend API for Candidates, Recruiters, Jobs, Companies, Applications and AI.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  // ============================================================
  // AZURE PORT
  // ============================================================

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`HireCoder API running on port ${port}`);
}

bootstrap();
