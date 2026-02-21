import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { OrderEntity } from '@be-aliant/common';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().default(3306),
                DB_USER: Joi.string().required(),
                DB_PASS: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                AWS_REGION: Joi.string().default('us-east-1'),
                AWS_ENDPOINT: Joi.string().required(),
                AWS_ACCESS_KEY_ID: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
                SQS_QUEUE_URL: Joi.string().required(),
                SQS_POLL_INTERVAL_MS: Joi.number().default(5000),
            }),
        }),

        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASS'),
                database: config.get<string>('DB_NAME'),
                entities: [OrderEntity],
                // synchronize: false — o schema é gerenciado exclusivamente pela API.
                // O Worker apenas lê/escreve dados, nunca altera a estrutura do banco.
                synchronize: false,
                logging: false,
            }),
        }),

        ConsumerModule,
    ],
})
export class AppModule { }
