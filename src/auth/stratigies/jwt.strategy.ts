import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../DTO/jwt-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * ============================================================
 * JWT Strategy
 * ============================================================
 *
 * Purpose
 * -------
 * Responsible for authenticating incoming JWT tokens.
 *
 * Passport automatically calls this strategy whenever
 * a protected route is accessed.
 *
 * Responsibilities
 * ----------------
 * ✔ Extract JWT from Authorization header.
 * ✔ Verify JWT signature.
 * ✔ Verify token expiration.
 * ✔ Return authenticated user payload.
 *
 * Flow
 * ----
 * Client
 *    ↓
 * Bearer Token
 *    ↓
 * Passport
 *    ↓
 * JwtStrategy
 *    ↓
 * validate()
 *    ↓
 * req.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }
  /**
   * ============================================================
   * Validate JWT Payload
   * ============================================================
   *
   * Purpose
   * -------
   * This method is automatically called by Passport
   * after the JWT has been successfully verified.
   *
   * Important
   * ---------
   * At this point:
   * ✔ Signature is valid.
   * ✔ Token is not expired.
   * ✔ JWT_SECRET matched.
   *
   * Whatever is returned from this method
   * becomes available as `req.user`.
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return user;
  }
}
