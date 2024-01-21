import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

// Uses DI to find the current user
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    // Find the current user using the Users Service if userId is in context
    const { userId } = request.session || {};
    if (userId) {
      const user = await this.usersService.findOne(parseInt(userId));
      request.currentUser = user;
    }

    return handler.handle();
  }
}
