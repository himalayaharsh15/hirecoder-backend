import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * ============================================================
 * Login User DTO
 * ============================================================
 *
 * Purpose
 * -------
 * Validates the data received from the client during login.
 *
 * Why use a separate DTO?
 * -----------------------
 * Login and Register have different requirements.
 *
 * Register requires:
 * ✔ name
 * ✔ email
 * ✔ password
 * ✔ confirmPassword
 *
 * Login only requires:
 * ✔ email
 * ✔ password
 *
 * This follows the Single Responsibility Principle (SRP)
 * and keeps validation clean and maintainable.
 *
 * Example Request
 * ---------------
 * {
 *   "email": "john@gmail.com",
 *   "password": "Password@123"
 * }
 */
export class LoginUserDto {
  /**
   * User's registered email address.
   */
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  /**
   * User's password.
   *
   * Note:
   * -----
   * We only validate that a password is provided.
   * Complexity validation is not required during login
   * because the password was already validated during registration.
   */
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}
