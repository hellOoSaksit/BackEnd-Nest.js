import { HttpException, HttpStatus, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async validateMember(email: string, password: string): Promise<any> {
        try {
            const cacheKey = `member:${email}`;
            const cache = await this.cacheManager.get<string>(cacheKey);
            let member;
            
            if (cache) {
                member = cache;
            } else {
                member = await this.prisma.member.findUnique({
                    where: { email },
                    include: {
                        Profile: {
                            select: {
                                name: true,
                                phone: true,
                                address: true
                            }
                        }
                    }
                });

                if (!member) {
                    throw new HttpException('ไม่พบบัญชีผู้ใช้', HttpStatus.UNAUTHORIZED);
                }

                console.log(`DB : MODE`);
                await this.cacheManager.set(cacheKey, member);
            }

            const isPasswordValid = await argon2.verify(member.password, password);
            if (!isPasswordValid) {
                throw new HttpException('รหัสผ่านไม่ถูกต้อง', HttpStatus.UNAUTHORIZED);
            }

            const { password: _, ...result } = member;
            return result;

        } catch (error) {
            throw error;
        }
    }

    async login(member: any, reply: FastifyReply) {
      const payload = {
          email: member.email,
          memberId: member.memberId,
          name: member.Profile?.name,
          phone: member.Profile?.phone,
          address: member.Profile?.address,
          role: member.role,
          point: 0,
          balance: 0,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          createdBy: member.createdBy,
          updatedBy: member.updatedBy
      };
  
      // สร้าง access token และ refresh token
      const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload, {
              secret: this.configService.get<string>('JWT_SECRET'),
              expiresIn: this.configService.get<string>('JWT_EXPIRESIN')
          }),
          this.jwtService.signAsync(payload, {
              secret: this.configService.get<string>('JWT_REFRESH'),
              expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRESIN')
          })
      ]);
  
      // ตั้งค่า cookies
      reply.setCookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 3600000 // 1 hour
      });
  
      reply.setCookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      return {
          status: 'SUCCESS',
          message: 'เข้าสู่ระบบสำเร็จ',
          data: {
              access_token: accessToken,
              refresh_token: refreshToken
          },
      };
  }

    async refreshToken(refreshToken: string, reply: FastifyReply) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH')
            });

            const member = await this.prisma.member.findUnique({
                where: { memberId: payload.memberId },
                include: {
                    Profile: {
                        select: {
                            name: true,
                            phone: true,
                            address: true
                        }
                    }
                }
            });

            if (!member) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.login(member, reply);

        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(reply: FastifyReply) {
        // ลบทั้ง access token และ refresh token cookies
        reply.setCookie('access_token', '', {
            httpOnly: true,
            path: '/',
            expires: new Date(0)
        });

        reply.setCookie('refresh_token', '', {
            httpOnly: true,
            path: '/',
            expires: new Date(0)
        });

        return {
            status: 'SUCCESS',
            message: 'ออกจากระบบสำเร็จ',
            timestamp: '2025-04-14 10:21:18',
            user: 'hellOoSaksit'
        };
    }
}