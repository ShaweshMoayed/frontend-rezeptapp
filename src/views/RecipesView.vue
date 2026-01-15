<template>
  <section class="page">
    <header class="page-head">
      <div>
        <h1>Rezepte</h1>
        <p>Suche nach Rezepten oder filtere nach Kategorie.</p>
      </div>

      <button class="btn" @click="goCreate">+ Rezept erstellen</button>
    </header>

    <div class="filters">
      <input v-model="search" class="input" type="search" placeholder="Suchen…" />

      <select v-model="category" class="select">
        <option value="">Alle Kategorien</option>

        <!-- ✅ Eigene Rezepte -->
        <option :value="MINE_VALUE">Eigene Rezepte</option>

        <option v-for="c in categoriesUi" :key="c" :value="c">
          {{ categoryLabel(c) }}
        </option>
      </select>

      <button class="btn secondary" @click="load" :disabled="store.loading">
        {{ store.loading ? 'Lädt…' : 'Laden' }}
      </button>

      <button
        class="btn secondary"
        @click="toggleFavoritesOnly"
        :disabled="store.loading || store.favLoading"
      >
        {{ favoritesOnly ? 'Alle anzeigen' : 'Nur Favoriten' }}
      </button>
    </div>

    <div v-if="store.error" class="alert">
      {{ store.error }}
      <button class="link" @click="store.refresh">Erneut versuchen</button>
    </div>

    <div v-if="store.loading" class="skeleton-grid">
      <div v-for="i in 8" :key="i" class="skeleton"></div>
    </div>

    <div v-else class="grid">
      <!-- ✅ KEIN @open mehr – RecipeCard navigiert selbst -->
      <RecipeCard v-for="r in recipesUi" :key="String(r.id)" :recipe="r" />
    </div>

    <div v-if="!store.loading && recipesUi.length === 0 && !store.error" class="empty">
      <h3>Keine Rezepte gefunden</h3>
      <p>Versuche einen anderen Suchbegriff oder erstelle ein neues Rezept.</p>
      <button class="btn" @click="goCreate">Rezept erstellen</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RecipeCard from '@/components/RecipeCard.vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const store = useRecipesStore()
const auth = useAuthStore()
const toast = useToastStore()

const search = ref('')
const category = ref('')
const favoritesOnly = ref(false)

const MINE_VALUE = '__mine__'

function normalize(s: string) {
  return (s ?? '').trim().toLowerCase()
}

function categoryLabel(raw: string) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return ''
  if (trimmed === MINE_VALUE) return 'Eigene Rezepte'

  const key = normalize(trimmed)
  const map: Record<string, string> = {
    pasta: 'Pasta',
    healthy: 'Gesund',
    dessert: 'Dessert',
    italienisch: 'Italienisch',
    orientalisch: 'Orientalisch',
    vegan: 'Vegan',
    asiatisch: 'Asiatisch',
    mexikanisch: 'Mexikanisch',
    amerikanisch: 'Amerikanisch',
    mediterran: 'Mediterran',
    fruehstueck: 'Frühstück',
    frühstück: 'Frühstück',
    suppe: 'Suppe',
    suppen: 'Suppe',
    salat: 'Salat',
    grill: 'Grill',
    snack: 'Snack',
  }

  return map[key] ?? (trimmed.charAt(0).toUpperCase() + trimmed.slice(1))
}

const categoriesUi = computed(() => {
  const fromApi = (store.categories ?? []).filter(Boolean)
  if (fromApi.length) return fromApi

  const derived = new Set<string>()
  for (const r of store.recipes) {
    const c = (r.category ?? '').trim()
    if (c) derived.add(c)
  }
  return Array.from(derived).sort((a, b) => a.localeCompare(b))
})

const recipesUi = computed(() => {
  if (!favoritesOnly.value) return store.recipes
  const ids = new Set(store.favoriteIds.map(Number))
  return store.recipes.filter((r) => (r.id != null ? ids.has(Number(r.id)) : false))
})

async function load() {
  if (category.value === MINE_VALUE && !auth.isLoggedIn) {
    toast.info('Bitte einloggen, um deine eigenen Rezepte zu sehen.')
    category.value = ''
  }

  await store.loadRecipes({
    search: search.value?.trim() || '',
    category: category.value || '',
  })

  if (favoritesOnly.value && auth.isLoggedIn) {
    await store.loadFavoriteIds()
  }
}

async function toggleFavoritesOnly() {
  if (!auth.isLoggedIn) {
    toast.info('Du musst eingeloggt sein, um Favoriten zu filtern.')
    return
  }

  favoritesOnly.value = !favoritesOnly.value
  if (favoritesOnly.value) await store.loadFavoriteIds()
}

function goCreate() {
  router.push({ name: 'create-recipe' })
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 350) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), ms)
  }
}

const autoLoad = debounce(() => load(), 350)

watch(search, () => autoLoad())
watch(category, () => load())

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) return
    let changed = false

    if (category.value === MINE_VALUE) {
      category.value = ''
      changed = true
    }
    if (favoritesOnly.value) {
      favoritesOnly.value = false
      changed = true
    }

    if (changed) load()
  }
)

onMounted(async () => {
  await store.loadCategories()
  if (auth.isLoggedIn) await store.loadFavoriteIds()
  await load()
})
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

h1 { margin: 0; font-size: 2rem; font-weight: 900; letter-spacing: -0.02em; color: #1f2a24; }
.page-head p { margin: 6px 0 0; color: rgba(31, 42, 36, 0.75); }

.filters {
  display: grid;
  grid-template-columns: 1fr 260px auto auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.input, .select {
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 0 14px;
  outline: none;
  transition: box-shadow 160ms ease, border-color 160ms ease;
}

.input:focus, .select:focus {
  border-color: rgba(47, 93, 76, 0.35);
  box-shadow: 0 0 0 4px rgba(47, 93, 76, 0.14);
}

.btn {
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.25);
  background: #2f5d4c;
  color: #fff;
  font-weight: 800;
  padding: 0 16px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}

.btn:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0, 0, 0, 0.10); filter: brightness(1.03); }
.btn.secondary { background: rgba(47, 93, 76, 0.10); color: #2f5d4c; }

.alert {
  border: 1px solid rgba(180, 60, 60, 0.25);
  background: rgba(180, 60, 60, 0.08);
  color: rgba(120, 30, 30, 0.9);
  padding: 12px 14px;
  border-radius: 14px;
  margin-bottom: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.link { border: none; background: transparent; color: #2f5d4c; font-weight: 800; cursor: pointer; }

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }

@media (max-width: 980px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filters { grid-template-columns: 1fr 1fr auto auto; }
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
  .filters { grid-template-columns: 1fr; }
}

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
