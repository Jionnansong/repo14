import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store';

// Lazy loading views
const Login = () => import('../views/Login.vue');
const Layout = () => import('../views/Layout.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Accounts = () => import('../views/Accounts.vue');
const Shops = () => import('../views/Shops.vue');
const Products = () => import('../views/Products.vue');
const Settings = () => import('../views/Settings.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: Accounts,
        meta: { requiresAdmin: true },
      },
      {
        path: 'shops',
        name: 'Shops',
        component: Shops,
      },
      {
        path: 'products',
        name: 'Products',
        component: Products,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const authenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  if (to.meta.requiresAuth && !authenticated) {
    next('/login');
  } else if (to.meta.guest && authenticated) {
    next('/dashboard');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/dashboard'); // Silently fall back to dashboard if they are not admin
  } else {
    next();
  }
});

export default router;
