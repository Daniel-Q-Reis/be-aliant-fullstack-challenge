import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

/**
 * DTO de criação de pedido.
 * Nota: userId NÃO vem no body — é extraído do token JWT via @CurrentUser().
 */
export class CreateOrderDto {
    @ApiProperty({ example: 'Pedido de Notebook Dell XPS', description: 'Descrição do pedido' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 8500.00, description: 'Valor total do pedido (positivo)' })
    @IsNumber()
    @Min(0)
    totalAmount: number;
}
