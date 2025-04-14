import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          return req.cookies?.access_token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
    
    // ตรวจสอบว่ามีการตั้งค่า JWT_SECRET
    if (!this.configService.get<string>('JWT_SECRET')) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }

  async validate(payload: any) {
    return payload;
  }
}
