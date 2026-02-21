import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto, OrderEntity, OrderFilterDto, OrderStatus } from '@be-aliant/common';
import { SqsProducerService } from '../messaging/sqs-producer.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(OrderEntity)
        private readonly ordersRepository: Repository<OrderEntity>,
        private readonly sqsProducerService: SqsProducerService,
    ) { }

    async create(userId: string, dto: CreateOrderDto): Promise<OrderEntity> {
        const order = this.ordersRepository.create({
            ...dto,
            userId,
            status: OrderStatus.PENDENTE,
        });

        const savedOrder = await this.ordersRepository.save(order);

        // NOTA ARQUITETURAL: Em produção, utilizaríamos o Outbox Pattern para
        // garantir consistência transacional entre o banco e a fila SQS.
        // Se o SQS estiver indisponível após o save(), o pedido ficaria PENDENTE
        // no banco sem mensagem na fila. O Outbox Pattern resolve isso persistindo
        // o evento no banco na mesma transação e publicando de forma assíncrona.
        try {
            await this.sqsProducerService.sendMessage({
                orderId: savedOrder.id,
                userId: savedOrder.userId,
                totalAmount: savedOrder.totalAmount,
                sentAt: new Date().toISOString(),
            });
        } catch (error) {
            // SQS falhou após save bem-sucedido — pedido fica PENDENTE (documentado no README)
            this.logger.warn(`[Orders] Order ${savedOrder.id} saved but SQS publish failed. Will remain PENDENTE.`);
        }

        return savedOrder;
    }

    async findAll(userId: string, filter: OrderFilterDto): Promise<OrderEntity[]> {
        const where: Partial<OrderEntity> = { userId };

        if (filter.status) {
            where.status = filter.status;
        }

        return this.ordersRepository.find({ where, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string, userId: string): Promise<OrderEntity> {
        const order = await this.ordersRepository.findOne({ where: { id, userId } });

        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }

        return order;
    }
}
