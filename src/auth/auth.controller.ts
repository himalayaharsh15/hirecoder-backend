import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './DTO/register-user.dto';
import { LoginUserDto } from './DTO/login-user.dto';
import { RefreshTokenDto } from './DTO/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as currentUserType from './types/current-user.type';
import { GoogleLoginDto } from './DTO/google-login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists.',
  })
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  /**
   * Login user
   */
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  /**
   * Generate a new access token using refresh token
   */
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  /**
   * Logout authenticated user
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: currentUserType.CurrentUserType) {
    return this.authService.logout(user.id);
  }

  /**
   * ============================================================
   * Google Login
   * ============================================================
   *
   * The frontend sends the Google ID token.
   *
   * The backend:
   * 1. Verifies the token with Google.
   * 2. Finds or creates the HireCoder user.
   * 3. Generates the normal HireCoder JWT tokens.
   */
  @ApiOperation({
    summary: 'Login with Google',
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Google authentication.',
  })
  @Post('google')
  googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }
}
