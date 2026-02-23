import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'auth' },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, title: 'Tableau de bord' },
  },
  {
    path: '/spots',
    name: 'spots',
    component: () => import('@/pages/SpotsPage.vue'),
    meta: { requiresAuth: true, title: 'Emplacements' },
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('@/pages/CustomersPage.vue'),
    meta: { requiresAuth: true, title: 'Clients' },
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: () => import('@/pages/ReservationsPage.vue'),
    meta: { requiresAuth: true, title: 'Réservations' },
  },
  {
    path: '/reservations/:id',
    name: 'reservation-detail',
    component: () => import('@/pages/ReservationDetailPage.vue'),
    meta: { requiresAuth: true, title: 'Détail réservation' },
  },
  {
    path: '/fiscal',
    name: 'fiscal',
    component: () => import('@/pages/FiscalPage.vue'),
    meta: { requiresAuth: true, title: 'Fiscalité' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { requiresAuth: true, title: 'Paramètres' },
  },
  {
    path: '/coming-soon',
    name: 'coming-soon',
    component: () => import('@/pages/ComingSoonPage.vue'),
    meta: { requiresAuth: true, title: 'Bientôt disponible' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }
  if (to.name === 'login') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      next({ name: 'dashboard' })
      return
    }
  }
  next()
})
