<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders'

const router = useRouter()
const ordersStore = useOrdersStore()

const description = ref('')
const totalAmount = ref<number | null>(null)

async function handleSubmit() {
  if (!description.value || totalAmount.value === null) return
  try {
    await ordersStore.createOrder(description.value, totalAmount.value)
    router.push('/')
  } catch {
    // erro já salvo no ordersStore.error
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <button
        @click="router.back()"
        class="mb-4 flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Voltar
      </button>
      <h2 class="text-2xl font-bold text-white">Novo Pedido</h2>
      <p class="mt-1 text-sm text-slate-400">
        Preencha os dados abaixo para criar um pedido. Ele será enviado para processamento via SQS.
      </p>
    </div>

    <!-- Card formulário -->
    <div class="rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <div>
          <label for="description" class="mb-1.5 block text-sm font-medium text-slate-300">
            Descrição
          </label>
          <input
            id="description"
            v-model="description"
            type="text"
            required
            placeholder="Ex: Compra de equipamento de informática"
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div>
          <label for="totalAmount" class="mb-1.5 block text-sm font-medium text-slate-300">
            Valor Total (R$)
          </label>
          <input
            id="totalAmount"
            v-model.number="totalAmount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0,00"
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <!-- Erro -->
        <div
          v-if="ordersStore.error"
          class="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400"
        >
          {{ ordersStore.error }}
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="ordersStore.loading"
            class="flex flex-1 items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="ordersStore.loading"
              class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
            {{ ordersStore.loading ? 'Criando...' : 'Criar Pedido' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
