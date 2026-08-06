import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * ============================================================
 * Current User Decorator
 * ============================================================
 *
 * Purpose
 * -------
 * Returns the authenticated user attached by Passport.
 *
 * Authentication Flow
 * -------------------
 *
 * Request
 *      ↓
 * JwtAuthGuard
 *      ↓
 * Passport
 *      ↓
 * JwtStrategy
 *      ↓
 * validate()
 *      ↓
 * req.user
 *      ↓
 * CurrentUser Decorator
 *      ↓
 * Controller
 *
 * Usage
 * -----
 * @Get('me')
 * getProfile(@CurrentUser() user) {
 *    return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user;
  },
);
