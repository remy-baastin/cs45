import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Cross-Origin Resource Sharing for frontend client access
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global DTO validation checking
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ─── Swagger / OpenAPI Configuration ───────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FAQ Platform API')
    .setDescription(
      'Complete REST API documentation for the AI-powered Crowd-Sourced Dynamic FAQ Platform. ' +
      'Use the Authorize button to add your JWT Bearer token for protected routes.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token (obtained from POST /api/auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'User registration, login, and profile')
    .addTag('Users', 'Leaderboard, profiles, notifications, and bookmarks')
    .addTag('FAQs', 'Browse, search, and interact with FAQs')
    .addTag('Questions', 'Community Q&A, voting, and answers')
    .addTag('Admin', 'Admin-only moderation and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'FAQ Platform API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #6c63ff; }
    `,
  });
  // ───────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`[BOOTSTRAP] Dynamic FAQ Platform API running at: http://localhost:${port}/`);
  console.log(`[SWAGGER]   API documentation available at:      http://localhost:${port}/api/docs`);
}
bootstrap();
