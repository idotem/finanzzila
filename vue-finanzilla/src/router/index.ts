import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: DashboardView
        },
        {
            path: '/transactions',
            name: 'Transactions',
            component: () => import('../views/TransactionsView.vue')
        },
        {
            path: '/configuration',
            name: 'ConfigurationTab',
            component: () => import('../views/ConfigurationView.vue')
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue')
        }
    ]
});

export default router;
