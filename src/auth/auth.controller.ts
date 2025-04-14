import { Controller, Post, Get, Request, UseGuards, Res, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './guard/role.decorator';
import { RegisterMemberDto } from './dto/register-member-dto';
import { RegisterService } from './register.service';
import { LoginMemberDto } from './dto/login-member-dto';
import { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registerService: RegisterService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
      @Request() req,
      @Body() loginDto: LoginMemberDto,
      @Res({ passthrough: true }) reply: FastifyReply
  ) {
      try {
          return await this.authService.login(req.user, reply);
      } catch (error) {
          console.error('Login Controller Error:', {
              error: error.message,
              timestamp: '2025-04-14 10:26:06',
              user: 'hellOoSaksit'
          });
          throw error;
      }
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) reply: FastifyReply) {
    try {
      const refreshToken = req.cookies.refresh_token;
      console.log('Refresh token request received', { 
        hasToken: !!refreshToken,
        timestamp: new Date().toISOString()
      });
      
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      
      return this.authService.refreshToken(refreshToken, reply);
    } catch (error) {
      console.error('Refresh token error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
  
  @Post('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
      return this.authService.logout(reply);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('MEMBER')
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  async register(@Body() dto: RegisterMemberDto) {
    return this.registerService.Register(dto);
  }
}