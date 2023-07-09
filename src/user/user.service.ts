import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserWithoutPassword } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findOne(id: number): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'email'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async validateUserPassword(
    email: string,
    plainPassword: string,
  ): Promise<User> {
    try {
      const user = await this.findOneByEmail(email);
      if (user && (await bcrypt.compare(plainPassword, user.password))) {
        return user;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Wrong email or password');
      }
    }
  }

  async create(userCreateDto: CreateUserDto): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne({
      where: {
        email: userCreateDto.email,
      },
    });

    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userCreateDto.password, 10);
    userCreateDto.password = hashedPassword;
    const newUser = this.usersRepository.create(userCreateDto);
    const createdUser = await this.usersRepository.save(newUser);
    delete createdUser.password;
    return createdUser;
  }
}
