// role.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role'; // ใน Payload
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);