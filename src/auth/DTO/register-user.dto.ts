import { UserRole } from '@prisma/client/wasm';
import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { IsPasswordMatching } from 'src/common/validators/password-match.validator';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

export class RegisterUserDto {
  @IsString({ message: 'Enter a Valid Name' })
  @IsNotEmpty({ message: 'Please enter a Name' })
  name!: string;

  @IsEmail({}, { message: 'eneter a valid mail ID' })
  @IsNotEmpty({ message: 'Please enter mail ID' })
  email!: string;

  @MinLength(8, {
    message: 'password shuld be of minimum length 8 charecters',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
  })
  password!: string;

  @IsString({ message: 'Eneter a valid Password' })
  @IsNotEmpty({ message: 'Please enter a Name' })
  @IsPasswordMatching('password', { message: 'psw does not match' })
  confirmPassword!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
