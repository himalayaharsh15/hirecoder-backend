import { IsString } from 'class-validator';

/**
 * DTO used when the frontend sends the Google ID token.
 *
 * The backend will verify this token with Google before
 * using any information from it.
 */
export class GoogleLoginDto {
  @IsString()
  credential!: string;
}
