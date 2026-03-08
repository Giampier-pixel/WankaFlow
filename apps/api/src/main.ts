// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  })

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('WankaFlow API')
    .setDescription('B2B/B2C E-commerce Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Products', 'Product catalog')
    .addTag('Categories', 'Product categories')
    .addTag('Orders', 'Order management')
    .addTag('Payments', 'Payment processing')
    .addTag('Inventory', 'Stock management')
    .addTag('Users', 'User management')
    .addTag('Reports', 'Analytics & reports')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`\n🚀 WankaFlow API running on: http://localhost:${port}`)
  console.log(`📚 Swagger docs:             http://localhost:${port}/api/docs`)
  console.log(`🔌 WebSocket namespace:      ws://localhost:${port}/events\n`)
}

bootstrap()
