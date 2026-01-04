<template>
  <article class="card" @click="$emit('open', recipe.id)" role="button" tabindex="0">
    <div class="media">
      <img :src="imageSrc" :alt="recipe.title || 'Rezeptbild'" loading="lazy" />

      <span v-if="recipe.category" class="badge">
        {{ categoryLabel(recipe.category) }}
      </span>

      <button
        class="fav"
        type="button"
        :aria-pressed="isFav"
        :title="isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
        @click.stop="toggleFav"
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
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Recipe } from '@/types/recipe'
import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'

// ✅ lokale Bilder (deine neuen PNGs)
import imgCarbonara from '@/assets/recipe-fallbacks/spaghetti-carbonara.png'
import imgVeggieBowl from '@/assets/recipe-fallbacks/veggie-bowl.png'
import imgPancakes from '@/assets/recipe-fallbacks/pancakes-mit-beeren.png'

import imgAglio from '@/assets/recipe-fallbacks/aglio-e-olio.png'
import imgCurry from '@/assets/recipe-fallbacks/gemuese-curry-mit-reis.png'
import imgFalafel from '@/assets/recipe-fallbacks/falafel-wrap.png'
import imgTofu from '@/assets/recipe-fallbacks/tofu-stir-fry.png'
import imgSushiBowl from '@/assets/recipe-fallbacks/sushi-bowl.png'
import imgChili from '@/assets/recipe-fallbacks/chili-sin-carne.png'
import imgGuacamole from '@/assets/recipe-fallbacks/guacamole-mit-nachos.png'
import imgBurritoBowl from '@/assets/recipe-fallbacks/burrito-bowl.png'
import imgCaesar from '@/assets/recipe-fallbacks/caesar-salad.png'
import imgTomatoSoup from '@/assets/recipe-fallbacks/tomatensuppe.png'
import imgScrambledEggs from '@/assets/recipe-fallbacks/ruehrei-fruehstueck.png'
import imgBurger from '@/assets/recipe-fallbacks/classic-burger.png'

const props = defineProps<{ recipe: Recipe }>()

defineEmits<{
  (e: 'open', id: number | string | undefined): void
}>()

const auth = useAuthStore()
const recipes = useRecipesStore()

onMounted(async () => {
  if (auth.isLoggedIn && recipes.favoriteIds.length === 0) {
    await recipes.loadFavoriteIds()
  }
})

function normalize(s: string) {
  return (s ?? '').trim().toLowerCase()
}

function pickLocalImage(): string {
  const title = normalize(props.recipe.title ?? '')
  const cat = normalize(props.recipe.category ?? '')

  // Title-based matching (sehr robust, unabhängig von Category)
  if (title.includes('carbonara')) return imgCarbonara
  if (title.includes('veggie') || title.includes('bowl')) return imgVeggieBowl
  if (title.includes('pancake') || title.includes('beeren')) return imgPancakes

  if (title.includes('aglio') || title.includes('olio')) return imgAglio
  if (title.includes('curry')) return imgCurry
  if (title.includes('falafel')) return imgFalafel
  if (title.includes('tofu') || title.includes('stir')) return imgTofu
  if (title.includes('sushi')) return imgSushiBowl
  if (title.includes('chili')) return imgChili
  if (title.includes('guacamole') || title.includes('nachos')) return imgGuacamole
  if (title.includes('burrito')) return imgBurritoBowl
  if (title.includes('caesar')) return imgCaesar
  if (title.includes('tomat')) return imgTomatoSoup
  if (title.includes('rührei') || title.includes('ruehrei') || title.includes('frühstück') || title.includes('fruehstueck')) return imgScrambledEggs
  if (title.includes('burger')) return imgBurger

  // Category fallback (falls Titel mal anders ist)
  if (cat === 'pasta' || cat === 'italienisch') return imgAglio
  if (cat === 'asiatisch') return imgTofu
  if (cat === 'orientalisch') return imgFalafel
  if (cat === 'vegan') return imgChili
  if (cat === 'mexikanisch') return imgBurritoBowl
  if (cat === 'amerikanisch') return imgBurger
  if (cat === 'salat') return imgCaesar
  if (cat === 'suppen') return imgTomatoSoup
  if (cat === 'frühstück' || cat === 'fruehstueck') return imgScrambledEggs
  if (cat === 'snack') return imgGuacamole

  // Default
  return imgVeggieBowl
}

const imageSrc = computed(() => {
  // ✅ wenn User ein eigenes Bild hochlädt, hat das Vorrang
  const b64 = props.recipe.imageBase64?.trim()
  if (b64) {
    if (b64.startsWith('data:image/')) return b64
    return `data:image/jpeg;base64,${b64}`
  }
  return pickLocalImage()
})

function categoryLabel(cat: string) {
  const c = normalize(cat)
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
    suppen: 'Suppen',
    salat: 'Salat',
    grill: 'Grill',
    snack: 'Snack',
  }
  return map[c] ?? (cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1))
}

const prepMinutes = computed(() => props.recipe.prepMinutes ?? null)
const servings = computed(() => props.recipe.servings ?? null)
const caloriesKcal = computed(() => props.recipe.nutrition?.caloriesKcal ?? null)

const hasAnyMeta = computed(
  () => prepMinutes.value != null || servings.value != null || caloriesKcal.value != null
)

const isFav = computed(() => {
  const id = Number(props.recipe.id)
  if (!id) return false
  return recipes.isFavorite(id)
})

async function toggleFav() {
  const id = Number(props.recipe.id)
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
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.09);
  border-color: rgba(47, 93, 76, 0.25);
}

.media { position: relative; height: 132px; background: rgba(47, 93, 76, 0.06); }
.media img { width: 100%; height: 100%; object-fit: cover; display: block; } /* Cards: cover ist ok */

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

.body { padding: 14px 16px 14px; }

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

.meta { display: flex; flex-wrap: wrap; align-items: center; color: rgba(31, 42, 36, 0.7); font-size: 0.86rem; }
.meta span:not(:last-child)::after { content: "•"; margin: 0 10px; color: rgba(31, 42, 36, 0.45); }
</style>
