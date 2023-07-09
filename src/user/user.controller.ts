import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto, ValidationError } from './user.dto';
import { UserWithoutPassword } from './user.entity';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 400,
    type: ValidationError,
  })
  create(@Body() userCreateDto: CreateUserDto): Promise<UserWithoutPassword> {
    return this.userService.create(userCreateDto);
  }
}
