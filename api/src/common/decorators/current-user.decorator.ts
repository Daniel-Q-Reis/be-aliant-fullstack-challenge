import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator de conveniência para extrair o usuário autenticado da requisição.
 * Uso: @CurrentUser() user: { id: string; email: string }
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): { id: string; email: string } => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
