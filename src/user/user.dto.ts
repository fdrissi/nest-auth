import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;
}

export class ValidationError {
  @ApiProperty()
  statusCode: number;

  @ApiProperty({ type: [String] })
  message: string[];

  @ApiProperty()
  error: string;
}
