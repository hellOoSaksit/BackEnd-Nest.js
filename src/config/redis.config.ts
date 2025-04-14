import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-ioredis-yet";
import Redis from "ioredis";

export const redisConfig = CacheModule.registerAsync({
    imports :[ConfigModule],
    inject:[ConfigService],
    useFactory : async(configService:ConfigService) => ({
            store: await redisStore({
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
        })
    })
})
