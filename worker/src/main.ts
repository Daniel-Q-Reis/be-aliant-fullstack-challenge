import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    /**
     * createApplicationContext inicializa o DI sem servidor HTTP.
     * O Worker permanece ativo pelo loop infinito no ConsumerService.onModuleInit().
     */
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['log', 'warn', 'error'],
    });

    const logger = new Logger('WorkerBootstrap');
    logger.log('Worker SQS Consumer started – polling loop active');

    // Mantém o processo vivo (o loop de polling é gerenciado pelo ConsumerService)
    await app.init();
}

bootstrap().catch((err) => {
    new Logger('WorkerBootstrap').error('Worker failed to start', err);
    process.exit(1);
});
