import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

/**
 * Interceptor de logging estruturado.
 * Registra método HTTP, path, status code e tempo de resposta em ms.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;
        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse<Response>();
                const duration = Date.now() - startTime;
                this.logger.log(`${method} ${url} ${response.statusCode} +${duration}ms`);
            }),
        );
    }
}
