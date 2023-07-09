import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from './jwt.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn().mockResolvedValue({ accessToken: 'validToken' }),
      me: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: JwtService,
          useValue: {
            sign: () => 'validToken',
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token when login is successful', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      expect(await controller.login(loginDto)).toEqual({
        accessToken: 'validToken',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error when login fails', async () => {
      const loginDto = { email: 'wrong@test.com', password: 'wrongPassword' };
      mockAuthService.login.mockRejectedValueOnce(new UnauthorizedException());

      try {
        await controller.login(loginDto);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('me', () => {
    it('should return a user info when a valid token is provided', async () => {
      const req = {
        headers: {
          authorization: 'bearer validToken',
        },
      };
      const userInfo = { id: 1, email: 'test@test.com' };
      mockAuthService.me.mockResolvedValueOnce(userInfo);

      const result = await controller.me(req);
      expect(result).toEqual(userInfo);
      expect(mockAuthService.me).toHaveBeenCalledWith(req);
    });

    it('should throw an error when token is not provided', async () => {
      const req = {
        headers: {},
      };
      mockAuthService.me.mockRejectedValueOnce(new UnauthorizedException());

      try {
        await controller.me(req);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
      expect(mockAuthService.me).toHaveBeenCalledWith(req);
    });

    it('should throw an error when token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'bearer invalidToken',
        },
      };
      mockAuthService.me.mockRejectedValueOnce(new UnauthorizedException());

      try {
        await controller.me(req);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
      expect(mockAuthService.me).toHaveBeenCalledWith(req);
    });
  });
});
