import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '@be-aliant/common';
import { ConsumerService } from './consumer.service';

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity])],
    providers: [ConsumerService],
})
export class ConsumerModule { }
