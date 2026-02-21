import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CreateOrderView from '../views/CreateOrderView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: LoginView,
        },
        {
            path: '/',
            name: 'Dashboard',
            component: DashboardView,
            meta: { requiresAuth: true },
        },
        {
            path: '/orders/new',
            name: 'CreateOrder',
            component: CreateOrderView,
            meta: { requiresAuth: true },
        },
        {
            path: '/orders/:id',
            name: 'OrderDetail',
            component: OrderDetailView,
            meta: { requiresAuth: true },
        },
    ],
})

// Guard de autenticação — redireciona para /login se rota requer auth e não há token
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
