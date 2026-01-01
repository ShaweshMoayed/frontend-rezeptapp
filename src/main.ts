import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // ✅ Persistenter Login: beim Start user + favoriten laden
  const auth = useAuthStore(pinia)
  const recipes = useRecipesStore(pinia)

  if (auth.token) {
    await auth.fetchMe()
    if (auth.isLoggedIn) {
      await recipes.loadFavoriteIds()
    }
  }

  app.mount('#app')
}

bootstrap()
