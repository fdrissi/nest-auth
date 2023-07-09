import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from './jwt.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService;
  let mockJwtService;

  beforeEach(async () => {
    mockUserService = {
      validateUserPassword: jest.fn(),
      findOne: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a JWT when login is successful', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: bcrypt.hashSync(loginDto.password),
      };
      mockUserService.validateUserPassword.mockResolvedValueOnce(user);
      mockJwtService.sign.mockReturnValueOnce('validToken');

      const result = await service.login(loginDto);
      expect(result).toEqual({ accessToken: 'validToken' });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrongPassword' };
      mockUserService.validateUserPassword.mockResolvedValueOnce(null);

      try {
        await service.login(loginDto);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toBe('Wrong email or password');
      }
    });
  });

  describe('me', () => {
    it('should return user info when a valid JWT is provided', async () => {
      const jwtPayload = { id: 1 };
      const userInfo = { id: jwtPayload.id, email: 'test@test.com' };
      mockUserService.findOne.mockResolvedValueOnce(userInfo);

      const result = await service.me(jwtPayload);
      expect(result).toEqual(userInfo);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const jwtPayload = { id: 1 };
      mockUserService.findOne.mockResolvedValueOnce(null);

      try {
        await service.me(jwtPayload);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw UnauthorizedException when no JWT is provided', async () => {
      try {
        await service.me(null);
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
  });
});
