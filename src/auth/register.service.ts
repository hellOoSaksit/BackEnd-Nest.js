import { Injectable, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { RegisterMemberDto } from "./dto/register-member-dto";
import { PrismaService } from "src/prisma/prisma.service";
import { formatInTimeZone } from 'date-fns-tz'
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';
@Injectable()
export class RegisterService {
    constructor(
        @InjectQueue('registerQueue') private queue: Queue,
        private readonly prisma : PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async Register(dto: RegisterMemberDto) {
        try {
            const cacheKey = `member:${dto.email}`;
            const cache = await this.cacheManager.get<string>(cacheKey);
            let exists;
            
            if(cache){
                exists = cache;
            } else {
                exists = await this.prisma.member.findUnique({ 
                    where: { email: dto.email } 
                });
            }
            
            if (exists) { 
                return {
                    status: 'FAILED',
                    statusCode: HttpStatus.CONFLICT,
                    message: 'อีเมลนี้มีผู้ใช้งานแล้ว',
                    data: null,
                    requestedBy: 'System'
                };
            }

            const timeZone = 'Asia/Bangkok'
            const formatString = 'dd-MM-yyyy HH:mm'
            const nowTime = new Date()
            const thailandTime = formatInTimeZone(nowTime, timeZone, formatString)

            const jobRegister = await this.queue.add('register', dto, {
                attempts: 3,
                removeOnComplete: 100,
                removeOnFail: 100,
                jobId : `registerTime : ${thailandTime}`
            });

            const waitingQ = await this.queue.getWaitingCount();
            return {
                status: 'SUCCESS',
                message: 'ดำเนินการสมัครสมาชิกเรียบร้อยแล้ว',
                data : {
                    queueId: jobRegister.id,
                    queuePosition: `เลขคิวของคุณคือ : ${waitingQ}`, 
                    estimatedTime: `เวลาที่คิดว่าจะสมัครสำเร็จ ${waitingQ ** 2}  นาที่` 
                },
                requestedBy: 'System'
            };

        } catch (error) {
            console.error('Register Error:', error.message);
            throw new HttpException(
                'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่ภายหลัง',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}