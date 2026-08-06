import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Metadata key used by RolesGuard.
 */
export const ROLES_KEY = 'roles';

/**
 * Attach allowed roles to a route.
 *
 * Example:
 *
 * @Roles(UserRole.RECRUITER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
