import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { UserRole } from '@prisma/client';

import { ROLES_KEY } from '../../decorators/roles.decorator';

/**
 * ============================================================
 * Roles Guard
 * ============================================================
 *
 * Responsible for authorizing users based on their role.
 *
 * Flow
 * ----
 * Request
 *    ↓
 * JwtAuthGuard
 *    ↓
 * req.user
 *    ↓
 * RolesGuard
 *    ↓
 * Controller
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the roles attached by @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator -> allow access
    if (!requiredRoles) {
      return true;
    }

    // Get request object
    const request = context.switchToHttp().getRequest();

    // User was attached by JwtStrategy
    const user = request.user;

    // Check if user's role is allowed
    return requiredRoles.includes(user.role);
  }
}
