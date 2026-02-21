import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

/** DTO de filtro para listagem de pedidos — status é opcional */
export class OrderFilterDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
