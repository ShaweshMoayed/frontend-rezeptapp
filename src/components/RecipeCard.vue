<template>
  <RouterLink :to="toDetail" custom v-slot="{ navigate }">
    <article
      class="card"
      role="button"
      tabindex="0"
      @click="onCardClick(navigate)"
      @keydown.enter.prevent="onCardClick(navigate)"
      @keydown.space.prevent="onCardClick(navigate)"
    >
      <div class="media">
        <img :src="imageSrc" :alt="recipe.title || 'Rezeptbild'" loading="lazy" />

        <span v-if="recipe.category" class="badge">
          {{ categoryLabel(recipe.category) }}
        </span>

        <!-- ✅ Fav Button bleibt klickbar ohne Navigation -->
        <button
          class="fav"
          type="button"
          :aria-pressed="isFav"
          :title="isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
          @click.stop.prevent="toggleFav"
          :disabled="recipes.favLoading"
        >
          <span class="fav-icon" aria-hidden="true">{{ isFav ? '♥' : '♡' }}</span>
        </button>
      </div>

      <div class="body">
        <h3 class="title">{{ recipe.title || 'Unbenanntes Rezept' }}</h3>

        <p class="desc">
          {{ recipe.description || 'Keine Beschreibung vorhanden.' }}
        </p>

        <div class="meta" v-if="hasAnyMeta">
          <span v-if="prepMinutes != null">{{ prepMinutes }} min</span>
          <span v-if="servings != null">{{ servings }} Portionen</span>
          <span v-if="caloriesKcal != null">{{ caloriesKcal }} kcal</span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { Recipe } from '@/types/recipe'
import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'

const props = defineProps<{ recipe: Recipe }>()

const auth = useAuthStore()
const recipes = useRecipesStore()

onMounted(async () => {
  if (auth.isLoggedIn && recipes.favoriteIds.length === 0) {
    await recipes.loadFavoriteIds()
  }
})

const rid = computed(() => {
  const n = Number(props.recipe.id)
  return Number.isFinite(n) && n > 0 ? n : 0
})

const toDetail = computed(() => {
  // wenn rid 0 ist, wird RouterLink "nirgendwo" hin navigieren – Klick wird unten zusätzlich geblockt
  return { name: 'recipe-detail', params: { id: rid.value } }
})

function onCardClick(navigate: () => void) {
  if (!rid.value) return
  navigate()
}

const FALLBACKS = import.meta.glob('@/assets/recipe-fallbacks/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function filenameFromPath(p: string) {
  const parts = p.split('/')
  return (parts[parts.length - 1] || '').toLowerCase()
}

const FALLBACK_MAP = (() => {
  const m = new Map<string, string>()
  for (const [path, url] of Object.entries(FALLBACKS)) {
    m.set(filenameFromPath(path), url)
  }
  return m
})()

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function pickFromFolderByName(base: string): string | null {
  if (!base) return null
  const s = slugify(base)
  const tries = [`${s}.png`, `${s}.jpg`, `${s}.jpeg`, `${s}.webp`]
  for (const t of tries) {
    const hit = FALLBACK_MAP.get(t)
    if (hit) return hit
  }
  return null
}

function pickLocalImage(): string {
  const byTitle = pickFromFolderByName(props.recipe.title ?? '')
  if (byTitle) return byTitle

  const byCat = pickFromFolderByName(props.recipe.category ?? '')
  if (byCat) return byCat

  return Array.from(FALLBACK_MAP.values())[0] || ''
}

const imageSrc = computed(() => {
  const b64 = props.recipe.imageBase64?.trim()
  if (b64) {
    if (b64.startsWith('data:image/')) return b64
    return `data:image/jpeg;base64,${b64}`
  }
  return pickLocalImage()
})

function categoryLabel(cat: string) {
  const c = (cat ?? '').trim().toLowerCase()
  const map: Record<string, string> = {
    italienisch: 'Italienisch',
    orientalisch: 'Orientalisch',
    asiatisch: 'Asiatisch',
    vegan: 'Vegan',
    mexikanisch: 'Mexikanisch',
    salat: 'Salat',
    suppe: 'Suppe',
    frühstück: 'Frühstück',
    amerikanisch: 'Amerikanisch',
    dessert: 'Dessert',
    healthy: 'Gesund',
    pasta: 'Pasta',
  }
  return map[c] ?? (cat || '')
}

const prepMinutes = computed(() => props.recipe.prepMinutes ?? null)
const servings = computed(() => props.recipe.servings ?? null)
const caloriesKcal = computed(() => props.recipe.nutrition?.caloriesKcal ?? null)

const hasAnyMeta = computed(
  () => prepMinutes.value != null || servings.value != null || caloriesKcal.value != null
)

const isFav = computed(() => {
  const id = rid.value
  if (!id) return false
  return recipes.isFavorite(id)
})

async function toggleFav() {
  const id = rid.value
  if (!id) return
  await recipes.toggleFavorite(id)
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(40, 40, 40, 0.08);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  overflow: hidden;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  outline: none;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.09);
  border-color: rgba(47, 93, 76, 0.25);
}

.media { position: relative; height: 132px; background: rgba(47, 93, 76, 0.06); }
.media img { width: 100%; height: 100%; object-fit: cover; display: block; }

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(231, 238, 234, 0.92);
  color: #2f5d4c;
  border: 1px solid rgba(47, 93, 76, 0.22);
  backdrop-filter: blur(6px);
}

.fav {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 34px;
  width: 34px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.22);
  background: rgba(231, 238, 234, 0.92);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.fav:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,0.10); }
.fav:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
.fav-icon { font-size: 1.05rem; line-height: 1; color: #2f5d4c; }

.body {
  padding: 14px 16px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.title { margin: 0; font-size: 1.05rem; font-weight: 900; letter-spacing: -0.01em; color: #1f2a24; }
.desc { margin: 8px 0 12px; color: rgba(31, 42, 36, 0.75); font-size: 0.92rem; line-height: 1.4; }

.meta {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  color: rgba(31, 42, 36, 0.7);
  font-size: 0.86rem;
}
.meta span:not(:last-child)::after { content: "•"; margin: 0 10px; color: rgba(31, 42, 36, 0.45); }
</style>
