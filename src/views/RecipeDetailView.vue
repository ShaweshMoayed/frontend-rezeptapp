<template>
  <section class="page" v-if="recipeSafe">
    <!-- HERO -->
    <div class="hero">
      <img class="hero-img" :src="imageSrc" :alt="recipeSafe.title" draggable="false" />

      <div class="hero-card">
        <div class="hero-top">
          <div>
            <h1 class="title">{{ recipeSafe.title }}</h1>
            <p class="sub">{{ recipeSafe.description }}</p>

            <div class="chips">
              <span v-if="recipeSafe.category" class="chip">{{ categoryLabel(recipeSafe.category) }}</span>
              <span v-if="recipeSafe.prepMinutes != null" class="chip soft">{{ recipeSafe.prepMinutes }} min</span>
              <span v-if="recipeSafe.servings != null" class="chip soft">{{ recipeSafe.servings }} Portionen</span>
            </div>
          </div>

          <div class="actions">
            <button class="icon-btn" @click="toggleFavorite" :disabled="recipes.favLoading">
              <span class="icon" aria-hidden="true">{{ isFavorite ? '♥' : '♡' }}</span>
              <span>{{ isFavorite ? 'Favorit' : 'Favorisieren' }}</span>
            </button>

            <button class="icon-btn primary" @click="downloadPdf" :disabled="pdfLoading">
              <span class="icon" aria-hidden="true">⤓</span>
              <span>{{ pdfLoading ? 'Lädt…' : 'PDF' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <!-- LEFT: Zubereitung -->
      <div class="panel">
        <div class="panel-head">
          <h2>Zubereitung</h2>
          <p class="muted">Schritt für Schritt</p>
        </div>

        <div class="steps" v-if="steps.length">
          <details v-for="(s, idx) in steps" :key="idx" class="step" open>
            <summary>
              <span class="step-num">Schritt {{ idx + 1 }}</span>
              <span class="step-title">{{ s.title }}</span>
            </summary>
            <div class="step-body">
              <p v-for="(p, i) in s.paragraphs" :key="i">{{ p }}</p>
            </div>
          </details>
        </div>

        <div v-else class="empty">
          <p>Keine Zubereitung vorhanden.</p>
        </div>
      </div>

      <!-- RIGHT: Zutaten + Nährwerte -->
      <aside class="side">
        <div class="panel">
          <div class="panel-head row">
            <h2>Zutaten</h2>
            <div class="servings" v-if="recipeSafe.servings != null">
              <span>für</span>
              <strong>{{ recipeSafe.servings }}</strong>
              <span>Portionen</span>
            </div>
          </div>

          <ul class="ingredients" v-if="(recipeSafe.ingredients?.length ?? 0) > 0">
            <li v-for="ing in recipeSafe.ingredients" :key="String(ing.id ?? ing.name)">
              <span class="ing-left">{{ ing.name }}</span>
              <span class="ing-right">
                <span v-if="ing.amount">{{ ing.amount }}</span>
                <span v-if="ing.unit">&nbsp;{{ ing.unit }}</span>
              </span>
            </li>
          </ul>

          <div v-else class="empty">
            <p>Keine Zutaten vorhanden.</p>
          </div>
        </div>

        <div class="panel" v-if="hasNutrition">
          <div class="panel-head">
            <h2>Nährwerte</h2>
            <p class="muted">pro Rezept (falls vorhanden)</p>
          </div>

          <div class="nutrition-grid">
            <div class="nutri">
              <span>Kalorien</span>
              <strong>{{ recipeSafe.nutrition?.caloriesKcal ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Protein (g)</span>
              <strong>{{ recipeSafe.nutrition?.proteinG ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Fett (g)</span>
              <strong>{{ recipeSafe.nutrition?.fatG ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Kohlenhydrate (g)</span>
              <strong>{{ recipeSafe.nutrition?.carbsG ?? '—' }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section v-else class="page">
    <div v-if="loading" class="panel"><p>Lädt…</p></div>
    <div v-else class="panel error">
      <p>{{ error || 'Rezept nicht gefunden.' }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Recipe } from '@/types/recipe'
import { fetchRecipeById, downloadRecipePdf } from '@/api/recipes.api'
import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'

// lokale Bilder
import spaghettiImg from '@/assets/recipe-fallbacks/spaghetti.png'
import veggieImg from '@/assets/recipe-fallbacks/veggie-bowl.png'
import pancakesImg from '@/assets/recipe-fallbacks/pancakes.png'

const route = useRoute()
const auth = useAuthStore()
const recipes = useRecipesStore()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const error = ref('')
const pdfLoading = ref(false)

// TS-safe Zugriff fürs Template
const recipeSafe = computed(() => recipe.value)

const recipeId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : 0
})

const isFavorite = computed(() => {
  const id = recipeId.value
  if (!id) return false
  return recipes.isFavorite(id)
})

function categoryLabel(cat: string | null | undefined) {
  const raw = (cat ?? '').trim()
  if (!raw) return ''
  const c = raw.toLowerCase()
  const map: Record<string, string> = { pasta: 'Pasta', healthy: 'Gesund', dessert: 'Dessert' }
  return map[c] ?? raw
}

// immer lokale Bilder
const imageSrc = computed(() => {
  const t = (recipe.value?.title || '').toLowerCase()
  const c = (recipe.value?.category || '').toLowerCase().trim()

  if (t.includes('carbonara') || t.includes('spaghetti') || c === 'pasta') return spaghettiImg
  if (t.includes('veggie') || t.includes('bowl') || c === 'healthy') return veggieImg
  if (t.includes('pancake') || t.includes('pancakes') || c === 'dessert') return pancakesImg
  return veggieImg
})

const hasNutrition = computed(() => {
  const n = recipe.value?.nutrition
  return !!(n && (n.caloriesKcal != null || n.proteinG != null || n.fatG != null || n.carbsG != null))
})

/**
 * instructions -> Schritte als Blöcke
 */
const steps = computed(() => {
  const raw = (recipe.value?.instructions || '').trim()
  if (!raw) return []

  const blocks = raw
    .split(/\n\s*\n+/g)
    .map((b) => b.trim())
    .filter(Boolean)

  const out: Array<{ title: string; paragraphs: string[] }> = []

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const first = lines[0]
    if (!first) continue

    const m = first.match(/^(\d+)\)\s*(.*)$/)
    if (m) {
      const title = (m[2] || '').replace(/:\s*$/, '').trim() || `Schritt ${m[1]}`
      const paragraphs = lines
        .slice(1)
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

      out.push({ title, paragraphs })
      continue
    }

    out.push({
      title: first.replace(/:\s*$/, '').trim(),
      paragraphs: lines.slice(1).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean),
    })
  }

  return out
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const id = recipeId.value
    if (!id) throw new Error('Ungültige ID')

    recipe.value = await fetchRecipeById(id)

    // ✅ wenn eingeloggt und Favoriten noch nicht geladen -> nachladen
    if (auth.isLoggedIn && recipes.favoriteIds.length === 0) {
      await recipes.loadFavoriteIds()
    }
  } catch (e: any) {
    error.value = e?.message || 'Fehler beim Laden'
    recipe.value = null
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  const id = recipeId.value
  if (!id) return
  await recipes.toggleFavorite(id)
}

async function downloadPdf() {
  const id = recipeId.value
  if (!id) return

  pdfLoading.value = true
  try {
    const blob = await downloadRecipePdf(id)
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    const safeName = (recipe.value?.title || 'rezept').split(' ').join('_')
    a.download = `${safeName}.pdf`

    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    alert(e?.message || 'PDF konnte nicht geladen werden.')
  } finally {
    pdfLoading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
/* (Style ist 1:1 dein bestehender – unverändert) */
.page { max-width: 1100px; margin: 0 auto; padding: 26px 18px 46px; color: #1f2a24; }

.hero { position: relative; border-radius: 22px; overflow: hidden; box-shadow: 0 22px 60px rgba(0, 0, 0, 0.10); background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(40, 40, 40, 0.08); }
.hero-img { width: 100%; height: 260px; object-fit: cover; display: block; }
.hero-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); padding: 16px 18px 14px; }
.hero-top { display: flex; gap: 14px; justify-content: space-between; align-items: flex-start; }

.title { margin: 0; font-size: 1.9rem; font-weight: 900; letter-spacing: -0.02em; }
.sub { margin: 6px 0 6px; color: rgba(31, 42, 36, 0.78); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.chip { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; background: rgba(231, 238, 234, 0.92); border: 1px solid rgba(47, 93, 76, 0.22); color: #2f5d4c; font-weight: 800; font-size: 0.82rem; }
.chip.soft { background: rgba(47, 93, 76, 0.10); color: #2f5d4c; border-color: rgba(47, 93, 76, 0.18); }

.actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.icon-btn { height: 42px; border-radius: 999px; border: 1px solid rgba(47, 93, 76, 0.22); background: rgba(47, 93, 76, 0.08); color: #2f5d4c; padding: 0 14px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease; }
.icon-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0,0,0,0.10); filter: brightness(1.02); }
.icon-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }
.icon-btn.primary { background: #2f5d4c; color: #fff; }
.icon { font-size: 1.05rem; line-height: 1; }

.content { margin-top: 16px; display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 14px; }

.panel { border-radius: 18px; border: 1px solid rgba(40, 40, 40, 0.08); background: rgba(255, 255, 255, 0.55); box-shadow: 0 18px 40px rgba(0,0,0,0.06); padding: 16px; }
.panel.error { border-color: rgba(180, 60, 60, 0.25); background: rgba(180, 60, 60, 0.08); }

.panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.panel-head.row { align-items: center; }

.panel h2 { margin: 0; font-size: 1.15rem; font-weight: 900; }
.muted { margin: 0; color: rgba(31, 42, 36, 0.70); }

.steps { display: grid; gap: 10px; }
.step { border-radius: 14px; border: 1px solid rgba(40, 40, 40, 0.08); background: rgba(255,255,255,0.65); padding: 10px 12px; }
.step summary { cursor: pointer; display: flex; align-items: center; gap: 10px; list-style: none; }
.step summary::-webkit-details-marker { display: none; }

.step-num { font-weight: 900; color: #2f5d4c; background: rgba(47, 93, 76, 0.10); border: 1px solid rgba(47, 93, 76, 0.18); border-radius: 999px; padding: 6px 10px; font-size: 0.82rem; white-space: nowrap; }
.step-title { font-weight: 800; }

.step-body { margin-top: 8px; color: rgba(31, 42, 36, 0.80); line-height: 1.45; }
.step-body p { margin: 0 0 8px; }
.step-body p:last-child { margin-bottom: 0; }

.side { display: grid; gap: 14px; }
.servings { display: inline-flex; align-items: baseline; gap: 6px; color: rgba(31, 42, 36, 0.75); }

.ingredients { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ingredients li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 14px; border: 1px solid rgba(40, 40, 40, 0.08); background: rgba(255,255,255,0.65); }

.ing-left { font-weight: 800; }
.ing-right { color: rgba(31, 42, 36, 0.75); font-weight: 700; white-space: nowrap; }

.nutrition-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.nutri { border-radius: 14px; border: 1px solid rgba(40, 40, 40, 0.08); background: rgba(255,255,255,0.65); padding: 12px; }
.nutri span { display: block; color: rgba(31, 42, 36, 0.70); font-weight: 700; font-size: 0.88rem; }
.nutri strong { display: block; margin-top: 4px; font-size: 1.15rem; font-weight: 900; color: #1f2a24; }

.empty { color: rgba(31, 42, 36, 0.75); }

@media (max-width: 980px) {
  .hero-img { height: 220px; }
  .hero-top { flex-direction: column; }
  .actions { justify-content: flex-start; }
  .content { grid-template-columns: 1fr; }
}
</style>
