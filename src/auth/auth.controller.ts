import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../user/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiResponse({
    status: 201,
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wrong user or password',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
  })
  async me(@Req() req) {
    return this.authService.me(req);
  }
}
