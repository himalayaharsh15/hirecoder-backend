import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './DTO/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
      async register(registerUserDto:RegisterUserDto) {
          const hashPassword = await bcrypt.hash(registerUserDto.password , 10)
          return hashPassword
    }
}
