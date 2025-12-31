<template>
  <article class="card" @click="$emit('open', recipe.id)" role="button" tabindex="0">
    <div class="media">
      <img :src="imageSrc" :alt="recipe.title || 'Rezeptbild'" loading="lazy" />

      <span v-if="recipe.category" class="badge">
        {{ categoryLabel(recipe.category) }}
      </span>

      <!-- ❤️ Favorit (oben rechts) -->
      <button
        class="fav"
        type="button"
        :aria-pressed="isFav"
        :title="isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
        @click.stop="toggleFav"
        :disabled="favLoading"
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Recipe } from '@/types/recipe'

import { useAuthStore } from '@/stores/auth.store'
import { fetchMyFavoriteIds, addFavorite, removeFavorite } from '@/api/recipes.api'

// ✅ lokale Bilder
import fallbackSpaghetti from '@/assets/recipe-fallbacks/spaghetti.png'
import fallbackVeggie from '@/assets/recipe-fallbacks/veggie-bowl.png'
import fallbackPancakes from '@/assets/recipe-fallbacks/pancakes.png'

const props = defineProps<{ recipe: Recipe }>()

defineEmits<{
  (e: 'open', id: number | string | undefined): void
}>()

const auth = useAuthStore()

/**
 * ✅ Favoriten global cachen (damit nicht pro Card 1 Request passiert)
 */
let favIdsCache: number[] | null = null
let favIdsInFlight: Promise<number[]> | null = null

async function ensureFavoriteIds(): Promise<number[]> {
  if (favIdsCache) return favIdsCache
  if (!favIdsInFlight) {
    favIdsInFlight = fetchMyFavoriteIds()
      .then((ids) => (Array.isArray(ids) ? ids : []))
      .finally(() => {
        favIdsInFlight = null
      })
  }
  favIdsCache = await favIdsInFlight
  return favIdsCache
}

function pickLocalImage(): string {
  const title = (props.recipe.title ?? '').toLowerCase()
  const cat = (props.recipe.category ?? '').toLowerCase().trim()

  if (title.includes('carbonara') || title.includes('spaghetti') || cat === 'pasta') return fallbackSpaghetti
  if (title.includes('veggie') || title.includes('bowl') || cat === 'healthy') return fallbackVeggie
  if (title.includes('pancake') || cat === 'dessert') return fallbackPancakes

  return fallbackVeggie
}

const imageSrc = computed(() => {
  const b64 = props.recipe.imageBase64?.trim()
  if (b64) {
    if (b64.startsWith('data:image/')) return b64
    return `data:image/jpeg;base64,${b64}`
  }
  // ✅ keine URLs, nur lokal
  return pickLocalImage()
})

function categoryLabel(cat: string) {
  const c = cat.trim().toLowerCase()
  const map: Record<string, string> = {
    pasta: 'Pasta',
    healthy: 'Gesund',
    dessert: 'Dessert',
  }
  return map[c] ?? cat
}

const prepMinutes = computed(() => props.recipe.prepMinutes ?? null)
const servings = computed(() => props.recipe.servings ?? null)
const caloriesKcal = computed(() => props.recipe.nutrition?.caloriesKcal ?? null)

const hasAnyMeta = computed(
  () => prepMinutes.value != null || servings.value != null || caloriesKcal.value != null
)

/** ❤️ Favorit State */
const isFav = ref(false)
const favLoading = ref(false)

onMounted(async () => {
  if (!props.recipe.id) return
  if (!auth.isLoggedIn) return

  try {
    const ids = await ensureFavoriteIds()
    isFav.value = ids.includes(Number(props.recipe.id))
  } catch {
    // wenn favorites endpoint mal zickt -> einfach kein Herz aktiv
    isFav.value = false
  }
})

async function toggleFav() {
  if (!props.recipe.id) return

  if (!auth.isLoggedIn) {
    alert('Bitte zuerst einloggen, um Favoriten zu nutzen.')
    return
  }

  favLoading.value = true
  try {
    const id = Number(props.recipe.id)
    // Cache sicherstellen
    const ids = await ensureFavoriteIds()

    if (isFav.value) {
      await removeFavorite(id)
      isFav.value = false
      favIdsCache = ids.filter((x) => x !== id)
    } else {
      await addFavorite(id)
      isFav.value = true
      favIdsCache = Array.from(new Set([...ids, id]))
    }
  } catch (e: any) {
    alert(e?.message || 'Favorit konnte nicht geändert werden.')
  } finally {
    favLoading.value = false
  }
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
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.09);
  border-color: rgba(47, 93, 76, 0.25);
}

.media {
  position: relative;
  height: 132px;
  background: rgba(47, 93, 76, 0.06);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

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

/* ❤️ Favorit Button */
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

.fav:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.10);
}

.fav:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.fav-icon {
  font-size: 1.05rem;
  line-height: 1;
  color: #2f5d4c;
}

.body {
  padding: 14px 16px 14px;
}

.title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: #1f2a24;
}

.desc {
  margin: 8px 0 12px;
  color: rgba(31, 42, 36, 0.75);
  font-size: 0.92rem;
  line-height: 1.4;
  min-height: 2.6em;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  color: rgba(31, 42, 36, 0.7);
  font-size: 0.86rem;
}

.meta span:not(:last-child)::after {
  content: "•";
  margin: 0 10px;
  color: rgba(31, 42, 36, 0.45);
}
</style>
