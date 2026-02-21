import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '@be-aliant/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity]),
        // AuthModule exporta JwtAuthGuard e PassportModule para uso nas rotas protegidas
        AuthModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
