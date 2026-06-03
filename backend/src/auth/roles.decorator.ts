import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('user' | 'moderator' | 'admin')[]) =>
  SetMetadata(ROLES_KEY, roles);
