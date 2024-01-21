import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

// Typescript improvement to ensure only supports instances of classes
interface ClassConstructor {
  new (...args: any[]): {};
}

// Create custom decorator for syntax sugar
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

// Create custom interceptor to serialize entities into dtos before returning to clients
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // Run something before a request is handled by the request handler
    console.log('I am running before the handler');

    return handler.handle().pipe(
      map((data: any) => {
        // Run something before the response is sent out
        console.log('I am running before response is sent out');

        // Turn User entity into a DTO with property-specific exposure
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
