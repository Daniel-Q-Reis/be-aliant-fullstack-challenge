import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateOrderDto, OrderFilterDto } from '@be-aliant/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';

/** Todas as rotas de pedidos requerem JWT válido */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * POST /orders – cria pedido para o usuário autenticado
     * userId extraído do token JWT via @CurrentUser (não exposto no body)
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @CurrentUser() user: { id: string },
        @Body() createOrderDto: CreateOrderDto,
    ) {
        return this.ordersService.create(user.id, createOrderDto);
    }

    /**
     * GET /orders?status=PENDENTE|PROCESSADO – lista pedidos do usuário logado
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(
        @CurrentUser() user: { id: string },
        @Query() filter: OrderFilterDto,
    ) {
        return this.ordersService.findAll(user.id, filter);
    }

    /**
     * GET /orders/:id – detalhe de pedido (apenas do próprio usuário)
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.ordersService.findOne(id, user.id);
    }
}
