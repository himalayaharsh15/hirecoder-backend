import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './DTO/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './DTO/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './DTO/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './DTO/google-login.dto';

/**
 * ============================================================
 * Auth Service
 * ============================================================
 *
 * Handles authentication related business logic.
 *
 * Responsibilities
 * ----------------
 * ✔ Register User
 * ✔ Login User
 * ✔ Password Hashing
 * ✔ JWT Generation (later)
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * ============================================================
   * Register User
   * ============================================================
   *
   * Flow
   * ----
   * 1. Check if email already exists.
   * 2. Hash the password.
   * 3. Save the user.
   * 4. Return a safe response.
   */
  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        password: hashedPassword,
        role: registerUserDto.role ?? undefined, // Default role if not provided
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role, // Include role in the response
      },
    };
  }

  /**
   * ============================================================
   * Login User
   * ============================================================
   *
   * Purpose
   * -------
   * Authenticates an existing user.
   *
   * Flow
   * ----
   * 1. Find user by email.
   * 2. Validate password.
   * 3. Generate JWT.
   * 4. Return Access Token.
   */
  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Google-only accounts don't have a local password.
    // They must use Google authentication.
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google login. Please continue with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const hashedrefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: hashedrefreshToken },
    });

    return {
      message: 'Login successful',

      ...tokens,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role in the response
      },
    };
  }

  /**
   * ============================================================
   * Generate Access & Refresh Tokens
   * ============================================================
   *
   * Purpose
   * -------
   * Generates a pair of JWT tokens for the authenticated user.
   *
   * Tokens
   * ------
   * ✔ Access Token  -> Used to access protected APIs.
   * ✔ Refresh Token -> Used to obtain a new access token.
   *
   * Returns
   * -------
   * {
   *   accessToken,
   *   refreshToken
   * }
   */
  private async generateTokens(userId: string, email: string, role?: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    // Generate Access Token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Generate Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        hashedRefreshToken: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // New Step
    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // New Step
    const isRefreshTokenValid = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(
      user.id,
      payload.email,
      payload.role,
    );
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    return {
      message: 'Token verified successfully',

      ...tokens,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * ============================================================
   * Verify Refresh Token
   * ============================================================
   *
   * Purpose
   * -------
   * Verifies the refresh token signature
   * and extracts its payload.
   *
   * Throws
   * ------
   * UnauthorizedException
   * if token is invalid or expired.
   */
  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * ============================================================
   * Logout User
   * ============================================================
   *
   * Removes the stored refresh token.
   *
   * After logout:
   * ✔ Access Token will eventually expire.
   * ✔ Refresh Token can no longer generate new tokens.
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * ============================================================
   * Google Login
   * ============================================================
   *
   * Flow:
   * 1. Receive Google's ID token from the frontend.
   * 2. Verify the token with Google.
   * 3. Find the existing HireCoder user.
   * 4. If the user doesn't exist, create one.
   * 5. Generate HireCoder access + refresh tokens.
   *
   * Google verifies the user's identity.
   * HireCoder still owns the application's JWT session.
   */
  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    console.log('GOOGLE_CLIENT_ID exists:', !!googleClientId);
    console.log(
      'GOOGLE_CLIENT_ID valid format:',
      googleClientId?.endsWith('.apps.googleusercontent.com'),
    );

    if (!googleClientId) {
      throw new UnauthorizedException(
        'Google authentication is not configured',
      );
    }

    try {
      // OAuth2Client is used to verify Google's ID token.
      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: googleLoginDto.credential,
        audience: googleClientId,
      });

      // Only use information after Google's token has been verified.
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException(
          'Invalid Google authentication response',
        );
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;

      // Make sure the Google account contains the information
      // required to create/login to a HireCoder account.
      if (!googleId || !email || !name) {
        throw new UnauthorizedException(
          'Google account information is incomplete',
        );
      }

      // Only allow accounts whose Google email has been verified.
      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email address is not verified');
      }

      // ----------------------------------------------------------
      // Find user by Google ID first.
      // ----------------------------------------------------------

      let user = await this.prisma.user.findUnique({
        where: {
          googleId,
        },
      });

      // ----------------------------------------------------------
      // If Google ID isn't linked yet, check the email.
      //
      // This allows an existing HireCoder account to be linked
      // to its Google account.
      // ----------------------------------------------------------

      if (!user) {
        user = await this.prisma.user.findUnique({
          where: {
            email,
          },
        });
      }

      // ----------------------------------------------------------
      // Existing HireCoder user
      // ----------------------------------------------------------

      if (user) {
        // Existing email/password account that hasn't linked
        // Google yet.
        if (!user.googleId) {
          user = await this.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              googleId,
            },
          });
        }
      }

      // ----------------------------------------------------------
      // New HireCoder user
      // ----------------------------------------------------------

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            name,
            email,

            // Google users don't need a local password.
            password: null,

            // Store Google's stable account identifier.
            googleId,

            // New users are candidates by default.
            role: 'CANDIDATE',
          },
        });
      }

      // ----------------------------------------------------------
      // Generate HireCoder JWT tokens.
      // ----------------------------------------------------------

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Never store the refresh token itself.
      // Store only its bcrypt hash.
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hashedRefreshToken,
        },
      });

      return {
        message: 'Google login successful',
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      // Don't expose Google's internal verification details
      // to the client.
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
