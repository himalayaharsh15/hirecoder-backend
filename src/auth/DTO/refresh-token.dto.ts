import { IsJWT, IsNotEmpty } from 'class-validator';

/**
 * ============================================================
 * Refresh Token DTO
 * ============================================================
 *
 * Purpose
 * -------
 * Validates the incoming refresh token request.
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;
}
