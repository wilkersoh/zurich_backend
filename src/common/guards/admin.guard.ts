import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../enums/roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const userRole = request.headers['x-user-role'];

    if (!userRole) {
      throw new UnauthorizedException('x-user-role header is missing');
    }

    if (userRole !== Role.ADMIN) {
      throw new UnauthorizedException('Admin role required');
    }

    return true;
  }
}
