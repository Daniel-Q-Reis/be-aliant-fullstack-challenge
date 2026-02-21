import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SQSClient,
} from '@aws-sdk/client-sqs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderEntity, OrderStatus } from '@be-aliant/common';
import { ConsumerService } from './consumer.service';

// Mock do AWS SDK — sem chamadas reais ao SQS
jest.mock('@aws-sdk/client-sqs', () => ({
    SQSClient: jest.fn().mockImplementation(() => ({
        send: jest.fn(),
    })),
    ReceiveMessageCommand: jest.fn().mockImplementation((input) => ({ ...input, _type: 'receive' })),
    DeleteMessageCommand: jest.fn().mockImplementation((input) => ({ ...input, _type: 'delete' })),
}));

describe('ConsumerService – pollAndProcess', () => {
    let service: ConsumerService;
    let sqsSend: jest.Mock;

    const mockOrderRepository = {
        update: jest.fn(),
    };

    const SQS_MESSAGE = {
        Body: JSON.stringify({ orderId: 'order-uuid-1' }),
        ReceiptHandle: 'receipt-handle-abc',
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const mockConfigService = {
            get: jest.fn((key: string) => {
                const config: Record<string, string | number> = {
                    AWS_REGION: 'us-east-1',
                    AWS_ENDPOINT: 'http://localhost:4566',
                    AWS_ACCESS_KEY_ID: 'test',
                    AWS_SECRET_ACCESS_KEY: 'test',
                    SQS_QUEUE_URL: 'http://localhost:4566/000000000000/orders-queue',
                    SQS_POLL_INTERVAL_MS: 100,
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConsumerService,
                { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepository },
                { provide: 'ConfigService', useValue: mockConfigService },
            ],
        })
            .overrideProvider('ConfigService')
            .useValue(mockConfigService)
            .compile();

        service = module.get<ConsumerService>(ConsumerService);

        // Captura a instância mockada do SQSClient
        sqsSend = (SQSClient as jest.Mock).mock.results[
            (SQSClient as jest.Mock).mock.results.length - 1
        ].value.send;
    });

    it('Teste 1: UPDATE affected:1 → DeleteMessageCommand DEVE ser chamado', async () => {
        // Simula receive retornando 1 mensagem
        sqsSend.mockResolvedValueOnce({ Messages: [SQS_MESSAGE] });
        // Simula UPDATE bem-sucedido (pedido era PENDENTE)
        mockOrderRepository.update.mockResolvedValueOnce({ affected: 1 });
        // Simula delete bem-sucedido
        sqsSend.mockResolvedValueOnce({});

        await service.pollAndProcess();

        // Verifica que o send foi chamado 2x: receive + delete
        expect(sqsSend).toHaveBeenCalledTimes(2);
        expect(DeleteMessageCommand).toHaveBeenCalledWith(
            expect.objectContaining({ ReceiptHandle: 'receipt-handle-abc' }),
        );
    });

    it('Teste 2: UPDATE affected:0 → DeleteMessageCommand DEVE ser chamado (descarte idempotente)', async () => {
        sqsSend.mockResolvedValueOnce({ Messages: [SQS_MESSAGE] });
        // Simula UPDATE sem efeito (pedido já processado por outra réplica)
        mockOrderRepository.update.mockResolvedValueOnce({ affected: 0 });
        sqsSend.mockResolvedValueOnce({});

        await service.pollAndProcess();

        expect(sqsSend).toHaveBeenCalledTimes(2);
        expect(DeleteMessageCommand).toHaveBeenCalled();
    });

    it('Teste 3: UPDATE lança exceção → DeleteMessageCommand NÃO deve ser chamado', async () => {
        sqsSend.mockResolvedValueOnce({ Messages: [SQS_MESSAGE] });
        // Simula erro de banco (ex: timeout, deadlock)
        mockOrderRepository.update.mockRejectedValueOnce(new Error('DB connection lost'));

        await service.pollAndProcess();

        // Apenas 1 chamada ao SQS (receive) — delete não ocorre para a mensagem retornar à fila
        expect(sqsSend).toHaveBeenCalledTimes(1);
        expect(DeleteMessageCommand).not.toHaveBeenCalled();
    });
});
