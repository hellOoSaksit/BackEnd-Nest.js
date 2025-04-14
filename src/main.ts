import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET
  });

  await app.register(fastifyCors, {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
  });

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}

bootstrap();