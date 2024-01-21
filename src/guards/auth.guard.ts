import { CanActivate, ExecutionContext } from '@nestjs/common';

// Checks to see if user ID is in session context
// This is used for authenticated access control over routes
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.session.userId;
  }
}
