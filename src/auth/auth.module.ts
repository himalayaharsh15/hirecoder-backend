import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StringValue } from 'ms';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './stratigies/jwt.strategy';

/**
 * ============================================================
 * Auth Module
 * ============================================================
 *
 * Purpose
 * -------
 * Groups all authentication-related components.
 *
 * Responsibilities
 * ----------------
 * ✔ Register User
 * ✔ Login User
 * ✔ Generate JWT
 * ✔ Validate JWT (later)
 *
 * Why JwtModule?
 * --------------
 * Registers JwtService so it can be injected anywhere
 * within this module.
 *
 * Why ConfigModule?
 * -----------------
 * Loads environment variables from `.env`.
 * This keeps secrets out of the source code.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN')!,
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],

  exports: [JwtModule],
})
export class AuthModule {}
