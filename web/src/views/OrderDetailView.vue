<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const id = route.params.id as string

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(iso))
}

onMounted(() => ordersStore.fetchOrderById(id))
</script>

<template>
  <main class="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- Botão voltar -->
    <button
      @click="router.back()"
      class="mb-6 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
    >
      ← Voltar ao Dashboard
    </button>

    <!-- Loading -->
    <div v-if="ordersStore.loading" class="flex justify-center py-16">
      <span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
    </div>

    <!-- Erro -->
    <div
      v-else-if="ordersStore.error"
      class="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400"
    >
      {{ ordersStore.error }}
    </div>

    <!-- Detalhe do pedido -->
    <div
      v-else-if="ordersStore.currentOrder"
      class="rounded-2xl border border-slate-800 bg-slate-900 p-8"
    >
      <!-- Header do card com badge de status -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">Detalhe do Pedido</h2>
          <p class="mt-1 font-mono text-xs text-slate-500">{{ ordersStore.currentOrder.id }}</p>
        </div>
        <!-- Badge de status com cores semânticas -->
        <span
          :class="[
            'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1',
            ordersStore.currentOrder.status === 'PROCESSADO'
              ? 'bg-emerald-900/60 text-emerald-400 ring-emerald-700'
              : 'bg-amber-900/60 text-amber-400 ring-amber-700',
          ]"
        >
          <!-- Ícone ponto de status -->
          <span
            :class="[
              'mr-1.5 inline-block h-2 w-2 rounded-full',
              ordersStore.currentOrder.status === 'PROCESSADO' ? 'bg-emerald-400' : 'bg-amber-400',
            ]"
          />
          {{ ordersStore.currentOrder.status }}
        </span>
      </div>

      <!-- Campos de detalhe -->
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-xl bg-slate-800/50 px-5 py-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Descrição</dt>
          <dd class="mt-1 text-sm text-slate-200">{{ ordersStore.currentOrder.description }}</dd>
        </div>

        <div class="rounded-xl bg-slate-800/50 px-5 py-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Valor Total</dt>
          <dd class="mt-1 text-lg font-bold text-white">
            {{ formatCurrency(ordersStore.currentOrder.totalAmount) }}
          </dd>
        </div>

        <div class="rounded-xl bg-slate-800/50 px-5 py-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Criado em</dt>
          <dd class="mt-1 text-sm text-slate-200">{{ formatDate(ordersStore.currentOrder.createdAt) }}</dd>
        </div>

        <div class="rounded-xl bg-slate-800/50 px-5 py-4">
          <dt class="text-xs font-medium uppercase tracking-wider text-slate-500">Atualizado em</dt>
          <dd class="mt-1 text-sm text-slate-200">{{ formatDate(ordersStore.currentOrder.updatedAt) }}</dd>
        </div>
      </dl>
    </div>
  </main>
</template>
