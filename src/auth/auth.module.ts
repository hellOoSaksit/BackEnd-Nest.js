import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MemberModule } from 'src/member/member.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RegisterService } from './register.service';
import { BullModule } from '@nestjs/bullmq';
import { RegisterWork } from './works/registerWork';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports:[PrismaModule , MemberModule , PassportModule,ConfigModule,
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRESIN')
        }
      })
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: 'member',
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<string>('REDIS_PORT'),
        ttl : configService.get<number>('AUTHMEMBER_TTL')
      })
    }),
    BullModule.registerQueue(
      { name: 'registerQueue' },
      { name: 'loginQueue' }),
  ],
  controllers: [AuthController],
  providers: [AuthService , LocalStrategy , JwtStrategy ,RegisterService , RegisterWork],
})
export class AuthModule {}
