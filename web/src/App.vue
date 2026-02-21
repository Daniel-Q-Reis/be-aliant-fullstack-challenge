<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-950">
    <!-- Navbar — exibida apenas quando autenticado -->
    <nav v-if="authStore.isAuthenticated" class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo / Brand -->
          <RouterLink to="/" class="flex items-center gap-2">
            <span class="text-xl font-bold tracking-tight text-white">
              be<span class="text-sky-400">-aliant</span>
            </span>
          </RouterLink>

          <!-- Links de navegação -->
          <div class="flex items-center gap-6">
            <RouterLink
              to="/"
              class="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              active-class="text-white"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/orders/new"
              class="rounded-md bg-sky-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-500"
            >
              + Novo Pedido
            </RouterLink>
            <button
              @click="logout"
              class="text-sm font-medium text-slate-400 transition-colors hover:text-red-400"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Conteúdo da rota ativa -->
    <RouterView />
  </div>
</template>
