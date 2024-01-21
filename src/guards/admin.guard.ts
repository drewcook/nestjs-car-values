import { CanActivate, ExecutionContext } from '@nestjs/common';

// Checks to see if the current user in context is an admin
// Return false if they are not logged in
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.currentUser) {
      return false;
    }
    return request.currentUser.admin;
  }
}
