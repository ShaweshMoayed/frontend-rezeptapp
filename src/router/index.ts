import { createRouter, createWebHistory } from 'vue-router'
import RecipesView from '../views/RecipesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'rezepte',
      component: RecipesView, // Hauptseite mit Rezeptübersicht
    },
  ],
})

export default router
