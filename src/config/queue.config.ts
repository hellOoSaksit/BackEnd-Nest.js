import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const queueConfig = BullModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async(configService:ConfigService) => ({
        connection: {
            host: configService.get<string>('BULL_HOST') ,
            port: configService.get<number>('BULL_PORT')
        },
    })
});

