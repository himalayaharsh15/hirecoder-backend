import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateProfileDto } from './dto/upsert-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ============================================================
   * Create / Update Profile
   * ============================================================
   *
   * Uses Prisma Upsert.
   *
   * If profile exists
   *      -> Update
   *
   * Else
   *      -> Create
   */
  async createOrUpdateProfile(userId: string, dto: CreateProfileDto) {
    return this.prisma.profile.upsert({
      where: {
        userId,
      },

      update: {
        ...dto,
      },

      create: {
        ...dto,

        user: {
          connect: {
            id: userId,
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  /*
   * ============================================================
   * Get Profile
   * ============================================================
   */

  private async findProfile(userId: string, isPublic: boolean = false) {
    const select = isPublic
      ? { name: true }
      : { id: true, name: true, email: true };
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: select,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getMyProfile(userId: string) {
    return this.findProfile(userId, false);
  }
  //  /profile/:userId

  async getProfile(userId: string) {
    return this.findProfile(userId, true);
  }
}
