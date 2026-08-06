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

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

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
}
