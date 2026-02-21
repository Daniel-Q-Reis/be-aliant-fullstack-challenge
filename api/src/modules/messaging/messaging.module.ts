import { Global, Module } from '@nestjs/common';
import { SqsProducerService } from './sqs-producer.service';

/**
 * Módulo de mensageria totalmente isolado.
 * @Global() evita reimportar em cada módulo que precise publicar eventos.
 * Exporta apenas o SqsProducerService para consumo via injeção de dependência.
 */
@Global()
@Module({
    providers: [SqsProducerService],
    exports: [SqsProducerService],
})
export class MessagingModule { }
