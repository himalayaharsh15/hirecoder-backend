import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * ============================================================
 * JWT Authentication Guard
 * ============================================================
 *
 * Purpose
 * -------
 * Protects routes using JWT authentication.
 *
 * Flow
 * ----
 * Request
 *   ↓
 * AuthGuard
 *   ↓
 * Passport
 *   ↓
 * JwtStrategy
 *   ↓
 * validate()
 *   ↓
 * req.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
