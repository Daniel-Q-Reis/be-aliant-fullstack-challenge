<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function handleLogin() {
  error.value = null
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message ?? 'Credenciais inválidas. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card de login -->
      <div class="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-white">
            be<span class="text-sky-400">-aliant</span>
          </h1>
          <p class="mt-2 text-sm text-slate-400">Faça login para gerenciar seus pedidos</p>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-slate-300">
              E-mail
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="seu@email.com"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-slate-300">
              Senha
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <!-- Mensagem de erro -->
          <div
            v-if="error"
            class="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
