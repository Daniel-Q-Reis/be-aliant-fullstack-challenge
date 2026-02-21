import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UserEntity, OrderEntity } from '@be-aliant/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MessagingModule } from './modules/messaging/messaging.module';

@Module({
    imports: [
        // Carrega variáveis de ambiente com validação de schema obrigatório via Joi.
        // A aplicação não sobe se qualquer variável obrigatória estiver ausente.
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().default(3306),
                DB_USER: Joi.string().required(),
                DB_PASS: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRES_IN: Joi.string().default('1d'),
                AWS_REGION: Joi.string().default('us-east-1'),
                AWS_ENDPOINT: Joi.string().required(),
                AWS_ACCESS_KEY_ID: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
                SQS_QUEUE_URL: Joi.string().required(),
                SQS_POLL_INTERVAL_MS: Joi.number().default(5000),
                PORT: Joi.number().default(3000),
            }),
        }),

        // Conexão com MySQL via TypeORM – configuração assíncrona via ConfigService
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASS'),
                database: config.get<string>('DB_NAME'),
                entities: [UserEntity, OrderEntity],
                // ATENÇÃO: synchronize:true apenas para ambiente de desenvolvimento/teste.
                // Em produção, substituir por migrations TypeORM geradas via CLI.
                synchronize: true,
                logging: false,
            }),
        }),

        // Módulo global de mensageria – disponível em toda a aplicação via DI
        MessagingModule,
        UsersModule,
        AuthModule,
        OrdersModule,
    ],
})
export class AppModule { }
