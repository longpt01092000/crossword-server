import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const response = error.getResponse();
          const status = error.getStatus();

          const formattedError =
            typeof response === 'string'
              ? { message: response }
              : (response as { message?: string });

          return throwError(() => ({
            success: false,
            statusCode: status,
            error: error.name,
            message: formattedError.message || 'Unexpected error',
            timestamp: new Date().toISOString(),
          }));
        }

        return throwError(() => ({
          success: false,
          statusCode: 500,
          error: 'InternalServerError',
          message: error?.message || 'Internal server error',
          timestamp: new Date().toISOString(),
        }));
      }),
    );
  }
}
