import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

/**
 * DTO de criação de pedido.
 * Nota: userId NÃO vem no body — é extraído do token JWT via @CurrentUser().
 */
export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    totalAmount: number;
}
