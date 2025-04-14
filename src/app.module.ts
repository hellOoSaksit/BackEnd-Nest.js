import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { queueConfig } from './config/queue.config';
import { redisConfig } from './config/redis.config';
@Module({
  imports: [
    AuthModule, 
    MemberModule, 
    PrismaModule , 
    queueConfig , 
    ConfigModule.forRoot() , 
    redisConfig,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
