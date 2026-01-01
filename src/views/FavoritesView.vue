<template>
  <section class="page">
    <header class="page-head">
      <div>
        <h1>Favoriten</h1>
        <p>Alle Rezepte, die du favorisiert hast.</p>
      </div>

      <button class="btn secondary" @click="load" :disabled="loading || recipesStore.favLoading">
        {{ loading ? 'Lädt…' : 'Aktualisieren' }}
      </button>
    </header>

    <div v-if="error" class="alert">{{ error }}</div>

    <div v-if="loading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton"></div>
    </div>

    <div v-else class="grid">
      <RecipeCard
        v-for="r in favorites"
        :key="String(r.id)"
        :recipe="r"
        @open="openRecipe"
      />
    </div>

    <div v-if="!loading && favorites.length === 0 && !error" class="empty">
      <h3>Noch keine Favoriten</h3>
      <p>Gehe zu „Rezepte“ und tippe auf das Herz ♥.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const recipesStore = useRecipesStore()
const auth = useAuthStore()

const loading = ref(false)
const error = ref('')

const favorites = computed(() => recipesStore.favoriteRecipes)

async function load() {
  loading.value = true
  error.value = ''

  try {
    // Guard ist zwar im Router, aber sicher ist sicher:
    if (!auth.isLoggedIn) {
      router.push({ name: 'login', query: { redirect: '/favorites' } })
      return
    }

    // ✅ hier passiert alles über Store (kein fetchMyFavorites)
    await recipesStore.ensureFavoritesReady()

    // optional: wenn du wirklich "frisch" willst, statt Cache:
    // await recipesStore.loadFavoriteIds()
    // await recipesStore.loadRecipes({ search: '', category: '' })
  } catch (e: any) {
    error.value = e?.message || 'Favoriten konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

function openRecipe(id: number | string | undefined) {
  if (id == null) return
  router.push(`/rezepte/${id}`)
}

onMounted(load)
</script>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 28px 18px 40px; }

.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

h1 { margin: 0; font-size: 2rem; font-weight: 900; color: #1f2a24; }
.page-head p { margin: 6px 0 0; color: rgba(31, 42, 36, 0.75); }

.btn {
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.25);
  background: #2f5d4c;
  color: #fff;
  font-weight: 800;
  padding: 0 16px;
  cursor: pointer;
}

.btn.secondary { background: rgba(47, 93, 76, 0.10); color: #2f5d4c; }

.alert {
  border: 1px solid rgba(180, 60, 60, 0.25);
  background: rgba(180, 60, 60, 0.08);
  color: rgba(120, 30, 30, 0.9);
  padding: 12px 14px;
  border-radius: 14px;
  margin-bottom: 14px;
}

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

.empty {
  margin-top: 18px;
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.45);
  padding: 18px;
  text-align: center;
}

.skeleton-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.skeleton {
  height: 220px;
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.06);
  background: linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.65), rgba(255,255,255,0.35));
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
