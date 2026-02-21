import axios from 'axios'

/**
 * Instância Axios configurada para a API REST.
 * baseURL lida de VITE_API_URL (definido no .env).
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor de Request: injeta o Bearer token se existir no localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interceptor de Response: em 401/403 limpa sessão e redireciona para /login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        if (status === 401 || status === 403) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

export default api
