import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterMemberDto } from "../dto/register-member-dto";
import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
@Processor('registerQueue')
export class RegisterWork extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super();
    }
    async process(job: Job<any, any, string>): Promise<any> {
        try {
            const dto = job.data as RegisterMemberDto;
            const _UUID = uuidv4();
            const hashPassword = await argon2.hash(dto.password, {
                type: argon2.argon2id,
                timeCost: 3,
                memoryCost: 2 ** 16,
                parallelism: 1
            });
            const resultRegister = await this.prisma.$transaction(async (tx) => {
                const registerMember = await tx.member.create({
                    data: {
                        memberId: _UUID,
                        email: dto.email,        
                        password: hashPassword,  
                        role: 'MEMBER',
                    }
                });
                const registerProfile = await tx.profile.create({
                    data: {
                        memberId: registerMember.memberId,
                        name: dto.name
                    }
                });
                return { registerMember, registerProfile };
            });
            await this.cacheManager.set('member',resultRegister);
            const resultWork = {
                status: "SUCCESS",
                message: "สมัครสมาชิกสำเร็จ",
                data: {
                    memberId: resultRegister.registerMember.memberId,
                    email: resultRegister.registerMember.email
                }
            };
            return resultWork;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('Prisma Error:', error.code, error.meta);
                throw new HttpException('เกิดข้อผิดพลาดในการบันทึกข้อมูล', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            throw new HttpException(
                'เกิดข้อผิดพลาดในการสมัครสมาชิก', 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}