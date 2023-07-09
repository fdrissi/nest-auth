import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from './jwt.service';

@Module({
  imports: [UserModule, AuthModule],
  providers: [AuthService, JwtService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtService, JwtAuthGuard],
})
export class AuthModule {}
