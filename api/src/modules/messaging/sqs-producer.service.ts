import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsProducerService {
    private readonly logger = new Logger(SqsProducerService.name);
    private readonly sqsClient: SQSClient;
    private readonly queueUrl: string;

    constructor(private readonly configService: ConfigService) {
        // Endpoint configurável — aponta para LocalStack em dev e SQS real em produção
        this.sqsClient = new SQSClient({
            region: configService.get<string>('AWS_REGION'),
            endpoint: configService.get<string>('AWS_ENDPOINT'),
            credentials: {
                accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') ?? 'test',
                secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? 'test',
            },
        });

        this.queueUrl = configService.get<string>('SQS_QUEUE_URL') ?? '';
    }

    async sendMessage(payload: object): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(payload),
        });

        try {
            await this.sqsClient.send(command);
            this.logger.log(`[SQS] Message sent: ${JSON.stringify(payload)}`);
        } catch (error) {
            this.logger.error('[SQS] Failed to send message', error instanceof Error ? error.stack : error);
            // Re-lança para que o OrdersService possa tratar (pedido PENDENTE documentado no README)
            throw error;
        }
    }
}
