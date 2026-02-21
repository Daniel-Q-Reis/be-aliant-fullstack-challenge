import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de exceções HTTP.
 * Padroniza todas as respostas de erro no seguinte formato:
 * { statusCode, message, error, path, timestamp }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const responseBody = exception.getResponse();

            if (typeof responseBody === 'string') {
                message = responseBody;
            } else if (typeof responseBody === 'object') {
                const body = responseBody as Record<string, any>;
                message = body.message ?? message;
                error = body.error ?? error;
            }
        } else {
            // Erros não esperados são logados com stack trace
            this.logger.error('Unexpected error', exception instanceof Error ? exception.stack : exception);
        }

        response.status(statusCode).json({
            statusCode,
            message,
            error,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
