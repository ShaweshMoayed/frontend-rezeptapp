import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },

  { path: '/rezepte', name: 'recipes', component: () => import('@/views/RecipesView.vue') },
  { path: '/rezepte/neu', name: 'create-recipe', component: () => import('@/views/CreateRecipeView.vue') },
  {
    path: '/rezepte/:id',
    name: 'recipe-detail',
    component: () => import('@/views/RecipeDetailView.vue'),
    props: true,
  },

  { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
  { path: '/plan', name: 'meal-plan', component: () => import('@/views/MealPlanView.vue') },

  // ✅ Favoriten nur für eingeloggte User
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

// ✅ Guard: Favorites nur wenn eingeloggt
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // optional: wenn Token vorhanden aber user noch nicht geladen -> nachladen
  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }

  return true
})

export default router
