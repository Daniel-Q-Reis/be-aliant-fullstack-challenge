import { defineStore } from 'pinia'
import api from '../services/api'

export interface Order {
    id: string
    userId: string
    description: string
    totalAmount: number
    status: 'PENDENTE' | 'PROCESSADO'
    createdAt: string
    updatedAt: string
}

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        orders: [] as Order[],
        currentOrder: null as Order | null,
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchOrders(status?: string) {
            this.loading = true
            this.error = null
            try {
                const params = status ? { status } : {}
                const response = await api.get('/orders', { params })
                this.orders = response.data
            } catch (err: any) {
                this.error = err.response?.data?.message ?? 'Erro ao buscar pedidos'
            } finally {
                this.loading = false
            }
        },

        async fetchOrderById(id: string) {
            this.loading = true
            this.error = null
            this.currentOrder = null
            try {
                const response = await api.get(`/orders/${id}`)
                this.currentOrder = response.data
            } catch (err: any) {
                this.error = err.response?.data?.message ?? 'Pedido não encontrado'
            } finally {
                this.loading = false
            }
        },

        async createOrder(description: string, totalAmount: number): Promise<Order> {
            this.loading = true
            this.error = null
            try {
                const response = await api.post('/orders', { description, totalAmount })
                this.orders.unshift(response.data)
                return response.data
            } catch (err: any) {
                this.error = err.response?.data?.message ?? 'Erro ao criar pedido'
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
