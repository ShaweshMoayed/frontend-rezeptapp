// src/router/index.ts (UPDATED)
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/rezepte', name: 'recipes', component: () => import('@/views/RecipesView.vue') },

  {
    path: '/rezepte/neu',
    name: 'create-recipe',
    component: () => import('@/views/CreateRecipeView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/rezepte/:id',
    name: 'recipe-detail',
    component: () => import('@/views/RecipeDetailView.vue'),
    props: true,
  },

  {
    path: '/rezepte/:id/bearbeiten',
    name: 'edit-recipe',
    component: () => import('@/views/EditRecipeView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },

  // ✅ Stats jetzt auch Login-pflichtig
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { requiresAuth: true },
  },

  { path: '/plan', name: 'meal-plan', component: () => import('@/views/MealPlanView.vue') },

  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { requiresAuth: true },
  },

  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const toast = useToastStore()

  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    toast.info('Bitte einloggen, um diese Funktion zu nutzen.')
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
