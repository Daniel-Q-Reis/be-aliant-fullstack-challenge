import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Enum de status do pedido.
 * Exportado separadamente para reutilização no Worker (sem importar a entidade inteira).
 */
export enum OrderStatus {
    PENDENTE = 'PENDENTE',
    PROCESSADO = 'PROCESSADO',
}

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** UUID do usuário dono do pedido — armazenado como coluna simples (sem FK explícita) */
    @Column()
    userId: string;

    @Column()
    description: string;

    /**
     * Valor total do pedido.
     * precision: 10, scale: 2 obrigatório para evitar truncamento de centavos no MySQL.
     */
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDENTE })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
