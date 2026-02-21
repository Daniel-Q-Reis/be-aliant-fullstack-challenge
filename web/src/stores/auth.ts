import { defineStore } from 'pinia'
import api from '../services/api'

interface User {
    id: string
    name: string
    email: string
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') as string | null,
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state): boolean => !!state.token,
    },

    actions: {
        async login(email: string, password: string) {
            // POST /login — a API retorna { access_token: string }
            const response = await api.post('/login', { email, password })
            const { access_token } = response.data
            this.token = access_token
            localStorage.setItem('token', access_token)
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            window.location.href = '/login'
        },
    },
})
