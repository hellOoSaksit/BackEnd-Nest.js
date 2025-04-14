// role.guard.ts
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    // this.logger.log(`User role: ${user?.role || 'undefined'}`);
    console.log('User role:', user?.role || 'undefined'); // Log the user role for debugging
    return user && user.role && requiredRoles.includes(user.role); //<<-----แก้ไข user.role ถ้าเปลี่ยนน
  }
}