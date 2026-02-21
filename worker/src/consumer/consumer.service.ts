import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { OrderEntity, OrderStatus } from '@be-aliant/common';

@Injectable()
export class ConsumerService implements OnModuleInit {
    private readonly logger = new Logger(ConsumerService.name);
    private readonly sqsClient: SQSClient;
    private readonly queueUrl: string;
    private readonly pollInterval: number;

    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        private readonly configService: ConfigService,
    ) {
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
        this.pollInterval = configService.get<number>('SQS_POLL_INTERVAL_MS') ?? 5000;
    }

    onModuleInit(): void {
        this.logger.log('ConsumerService initialized – starting SQS polling loop');
        // setImmediate não bloqueia a inicialização do módulo
        setImmediate(() => this.startPollingLoop());
    }

    private async startPollingLoop(): Promise<void> {
        while (true) {
            try {
                await this.pollAndProcess();
            } catch (err) {
                // Fail-safe: captura erros inesperados e reinicia o ciclo para manter o Worker vivo
                this.logger.error('Unexpected error in polling loop', err);
            }
            await this.sleep(this.pollInterval);
        }
    }

    /** Método público para facilitar testes unitários */
    async pollAndProcess(): Promise<void> {
        const receiveCommand = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 1,
            // Long Polling: mantém a conexão aberta por até 20s aguardando mensagens,
            // reduzindo chamadas vazias e custo por requisição ao SQS
            WaitTimeSeconds: 20,
        });

        const response = await this.sqsClient.send(receiveCommand);

        if (!response.Messages || response.Messages.length === 0) {
            return;
        }

        const message = response.Messages[0];
        const receiptHandle = message.ReceiptHandle!;
        const payload = JSON.parse(message.Body!);
        const { orderId } = payload;

        let shouldDelete = false;

        try {
            // NOTA ARQUITETURAL: Idempotência via UPDATE condicional.
            // Se result.affected === 0, outra réplica já processou esta mensagem
            // ou ela não está mais PENDENTE. Descartamos silenciosamente deletando
            // da fila para evitar loops infinitos. O SQS garante entrega única
            // durante o VisibilityTimeout, mas não após sua expiração ou redelivery —
            // o UPDATE condicional protege o estado do banco nessas situações.
            const result = await this.orderRepository.update(
                { id: orderId, status: OrderStatus.PENDENTE },
                { status: OrderStatus.PROCESSADO },
            );

            if (result.affected && result.affected > 0) {
                this.logger.log(`[Worker] Order ${orderId} processed successfully`);
            } else {
                this.logger.warn(`[Worker] Order ${orderId} already processed or not found – discarding`);
            }

            // Marca para delete tanto em affected:1 (sucesso) quanto em affected:0 (descarte idempotente)
            shouldDelete = true;
        } catch (err) {
            // Erro de banco → NÃO deletar a mensagem
            // Ela retornará à fila automaticamente após o VisibilityTimeout
            this.logger.error(`[Worker] DB error processing order ${orderId} – message will return to queue`, err);
            shouldDelete = false;
        }

        if (shouldDelete) {
            await this.sqsClient.send(
                new DeleteMessageCommand({
                    QueueUrl: this.queueUrl,
                    ReceiptHandle: receiptHandle,
                }),
            );
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
