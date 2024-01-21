import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Relies on the CurrentUserInterceptor to find the current user and return it in context
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);
