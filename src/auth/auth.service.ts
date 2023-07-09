import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcryptjs';
import { UserWithoutPassword } from 'src/user/user.entity';
import { JwtService } from './jwt.service';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUserPassword(
      loginDto.email,
      loginDto.password,
    );
    if (user) {
      const payload: JwtPayload = { id: user.id };
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Wrong email or password');
    }
  }

  async me(jwtPayload: JwtPayload): Promise<UserWithoutPassword> {
    return this.userService.findOne(jwtPayload.id);
  }
}
