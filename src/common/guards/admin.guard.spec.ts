import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { Role } from '../enums/roles.enum';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    guard = new AdminGuard();

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-user-role': 'admin',
          },
        }),
      }),
    } as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when user has admin role', () => {
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException when x-user-role header is missing', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('x-user-role header is missing'),
    );
  });

  it('should throw UnauthorizedException when user role is not admin', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-user-role': Role.USER,
          },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('Admin role required'),
    );
  });
});
