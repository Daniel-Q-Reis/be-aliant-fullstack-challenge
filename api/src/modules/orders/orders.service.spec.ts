import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrderEntity, OrderStatus } from '@be-aliant/common';
import { OrdersService } from './orders.service';
import { SqsProducerService } from '../messaging/sqs-producer.service';

describe('OrdersService', () => {
    let service: OrdersService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };

    const mockSqsProducerService = {
        sendMessage: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(OrderEntity), useValue: mockRepository },
                { provide: SqsProducerService, useValue: mockSqsProducerService },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('deve salvar o pedido e chamar sendMessage com os dados corretos', async () => {
            const userId = 'user-uuid';
            const dto = { description: 'Pedido teste', totalAmount: 99.90 };
            const savedOrder = {
                id: 'order-uuid',
                userId,
                ...dto,
                status: OrderStatus.PENDENTE,
                createdAt: new Date(),
            };

            mockRepository.create.mockReturnValue(savedOrder);
            mockRepository.save.mockResolvedValue(savedOrder);

            await service.create(userId, dto);

            expect(mockRepository.save).toHaveBeenCalled();
            expect(mockSqsProducerService.sendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderId: 'order-uuid',
                    userId,
                }),
            );
        });

        it('deve retornar o pedido mesmo se o SQS falhar (pedido fica PENDENTE)', async () => {
            const userId = 'user-uuid';
            const dto = { description: 'Pedido teste', totalAmount: 50 };
            const savedOrder = { id: 'order-uuid', userId, ...dto, status: OrderStatus.PENDENTE };

            mockRepository.create.mockReturnValue(savedOrder);
            mockRepository.save.mockResolvedValue(savedOrder);
            mockSqsProducerService.sendMessage.mockRejectedValueOnce(new Error('SQS down'));

            // Não deve lançar — pedido salvo com sucesso, SQS falha é tratada internamente
            const result = await service.create(userId, dto);
            expect(result).toEqual(savedOrder);
        });
    });

    describe('findOne', () => {
        it('deve lançar NotFoundException se o pedido não pertencer ao usuário', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('order-uuid', 'outro-user-uuid')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('deve retornar o pedido quando encontrado', async () => {
            const order = { id: 'order-uuid', userId: 'user-uuid', status: OrderStatus.PENDENTE };
            mockRepository.findOne.mockResolvedValue(order);

            const result = await service.findOne('order-uuid', 'user-uuid');
            expect(result).toEqual(order);
        });
    });
});
