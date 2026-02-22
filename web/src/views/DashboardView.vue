<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrdersStore, type Order } from '../stores/orders'

const ordersStore = useOrdersStore()
const activeFilter = ref<string | undefined>(undefined)

async function applyFilter(status?: string) {
  activeFilter.value = status
  await ordersStore.fetchOrders(status)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

onMounted(() => ordersStore.fetchOrders())
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- Header da página -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">Pedidos</h2>
        <p class="mt-1 text-sm text-slate-400">Gerencie e acompanhe os seus pedidos</p>
      </div>
      <RouterLink
        to="/orders/new"
        class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-500"
      >
        + Criar Pedido
      </RouterLink>
    </div>

    <!-- Filtros de status -->
    <div class="mb-6 flex gap-2">
      <button
        v-for="f in [
          { label: 'Todos', value: undefined },
          { label: 'Pendente', value: 'PENDENTE' },
          { label: 'Processado', value: 'PROCESSADO' },
        ]"
        :key="f.label"
        @click="applyFilter(f.value)"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          activeFilter === f.value
            ? 'bg-sky-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white',
        ]"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Estado de carregamento -->
    <div v-if="ordersStore.loading" class="flex justify-center py-16">
      <span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
    </div>

    <!-- Estado de erro -->
    <div
      v-else-if="ordersStore.error"
      class="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400"
    >
      {{ ordersStore.error }}
    </div>

    <!-- Lista vazia -->
    <div
      v-else-if="ordersStore.orders.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20 text-center"
    >
      <p class="text-slate-400">Nenhum pedido encontrado.</p>
      <RouterLink to="/orders/new" class="mt-3 text-sm text-sky-400 hover:text-sky-300">
        Criar o primeiro pedido →
      </RouterLink>
    </div>

    <!-- Tabela de pedidos -->
    <div v-else class="overflow-hidden rounded-2xl border border-slate-800">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-800 bg-slate-900/60 text-left">
            <th class="px-6 py-3 font-medium text-slate-400">ID</th>
            <th class="px-6 py-3 font-medium text-slate-400">Descrição</th>
            <th class="px-6 py-3 font-medium text-slate-400">Valor</th>
            <th class="px-6 py-3 font-medium text-slate-400">Status</th>
            <th class="px-6 py-3 font-medium text-slate-400">Criado em</th>
            <th class="px-6 py-3 font-medium text-slate-400"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 bg-slate-900/30">
          <tr
            v-for="order in ordersStore.orders"
            :key="order.id"
            class="transition-colors hover:bg-slate-800/40"
          >
            <td class="px-6 py-4 font-mono text-xs text-slate-500">
              {{ order.id.slice(0, 8) }}…
            </td>
            <td class="px-6 py-4 text-slate-200">{{ order.description }}</td>
            <td class="px-6 py-4 font-medium text-white">{{ formatCurrency(order.totalAmount) }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  order.status === 'PROCESSADO'
                    ? 'bg-emerald-900/60 text-emerald-400 ring-1 ring-emerald-700'
                    : 'bg-amber-900/60 text-amber-400 ring-1 ring-amber-700',
                ]"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-slate-400">{{ formatDate(order.createdAt) }}</td>
            <td class="px-6 py-4">
              <RouterLink
                :to="`/orders/${order.id}`"
                class="text-sky-400 transition-colors hover:text-sky-300"
              >
                Ver →
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
