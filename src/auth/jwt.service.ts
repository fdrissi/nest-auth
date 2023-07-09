import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtService {
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  }
}
