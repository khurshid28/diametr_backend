import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    const now = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const delay = Date.now() - now;
        this.logger.log(
          `${method} ${url} -> ${JSON.stringify(response)} +${delay}ms`,
        );
      }),
    );
  }
}
