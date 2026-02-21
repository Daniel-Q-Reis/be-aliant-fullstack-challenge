import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SqsProducerService } from './sqs-producer.service';

// Mock do módulo completo do AWS SDK para testes unitários (sem chamadas reais)
jest.mock('@aws-sdk/client-sqs', () => ({
    SQSClient: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({ MessageId: 'mock-id' }),
    })),
    SendMessageCommand: jest.fn().mockImplementation((input) => input),
}));

describe('SqsProducerService', () => {
    let service: SqsProducerService;
    let mockSend: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        const mockConfigService = {
            get: jest.fn((key: string) => {
                const config: Record<string, string> = {
                    AWS_REGION: 'us-east-1',
                    AWS_ENDPOINT: 'http://localhost:4566',
                    SQS_QUEUE_URL: 'http://localhost:4566/000000000000/orders-queue',
                    AWS_ACCESS_KEY_ID: 'test',
                    AWS_SECRET_ACCESS_KEY: 'test',
                };
                return config[key];
            }),
        } as any;

        service = new SqsProducerService(mockConfigService);

        // Captura a instância mockada do SQSClient para fazer asserções
        const sqsInstance = (SQSClient as jest.Mock).mock.results[0].value;
        mockSend = sqsInstance.send;
    });

    it('deve chamar SQSClient.send com SendMessageCommand e o payload serializado', async () => {
        const payload = { orderId: 'uuid-1', total: 99.90 };

        await service.sendMessage(payload);

        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(SendMessageCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                MessageBody: JSON.stringify(payload),
            }),
        );
    });

    it('deve relançar o erro se SQSClient.send falhar', async () => {
        const sqsInstance = (SQSClient as jest.Mock).mock.results[0].value;
        sqsInstance.send.mockRejectedValueOnce(new Error('SQS unavailable'));

        await expect(service.sendMessage({ orderId: 'uuid-1' })).rejects.toThrow('SQS unavailable');
    });
});
