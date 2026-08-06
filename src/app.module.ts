import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { CompanyModule } from './company/company.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { SavedJobModule } from './saved-job/saved-job.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AiModule,
    UsersModule,
    ProfileModule,
    CompanyModule,
    JobModule,
    ApplicationModule,
    SavedJobModule,
    DashboardModule,
  ],
})
export class AppModule {}
