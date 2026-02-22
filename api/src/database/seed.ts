/**
 * Script de Seed — popula o banco com dados de demonstração.
 *
 * Uso em desenvolvimento local:
 *   cd api && npm run seed
 *
 * Uso no container Docker (após build):
 *   docker-compose exec api node dist/api/src/database/seed.js
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity, OrderEntity, OrderStatus } from '@be-aliant/common';

// Carrega o .env para execução local; dentro do Docker as vars já vêm do env_file
dotenv.config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [UserEntity, OrderEntity],
    synchronize: false,
});

async function seed(): Promise<void> {
    await AppDataSource.initialize();
    console.log('[Seed] Conexão com o banco estabelecida.');

    const userRepo = AppDataSource.getRepository(UserEntity);
    const orderRepo = AppDataSource.getRepository(OrderEntity);

    // Cria o usuário administrador de demonstração com senha hashed (bcrypt salt 10)
    const passwordHash = await bcrypt.hash('123456', 10);
    const user = userRepo.create({
        name: 'Admin',
        email: 'admin@be-aliant.com',
        password: passwordHash,
    });
    await userRepo.save(user);
    console.log(`[Seed] Usuário criado: ${user.email} (id: ${user.id})`);

    // Cria 3 pedidos de demonstração vinculados ao usuário acima
    const orders = orderRepo.create([
        {
            userId: user.id,
            description: 'Pedido de Notebook Dell XPS',
            totalAmount: 8500.0,
            status: OrderStatus.PENDENTE,
        },
        {
            userId: user.id,
            description: 'Pedido de Monitor LG 27"',
            totalAmount: 2300.5,
            status: OrderStatus.PROCESSADO,
        },
        {
            userId: user.id,
            description: 'Pedido de Teclado Mecânico',
            totalAmount: 450.0,
            status: OrderStatus.PENDENTE,
        },
    ]);

    await orderRepo.save(orders);
    orders.forEach((o) =>
        console.log(`[Seed] Pedido criado: "${o.description}" (id: ${o.id})`),
    );

    await AppDataSource.destroy();
    console.log('[Seed] Concluído com sucesso!');
}

seed().catch((err) => {
    console.error('[Seed] Erro:', err);
    process.exit(1);
});
