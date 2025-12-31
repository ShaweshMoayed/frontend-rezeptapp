<template>
  <section class="page" v-if="recipe">
    <!-- HERO -->
    <div class="hero">
      <img class="hero-img" :src="imageSrc" :alt="recipe.title" draggable="false" />

      <div class="hero-card">
        <div class="hero-top">
          <div>
            <h1 class="title">{{ recipe.title }}</h1>
            <p class="sub">{{ recipe.description }}</p>

            <div class="chips">
              <span v-if="recipe.category" class="chip">{{ categoryLabel(recipe.category) }}</span>
              <span v-if="recipe.prepMinutes != null" class="chip soft">{{ recipe.prepMinutes }} min</span>
              <span v-if="recipe.servings != null" class="chip soft">{{ recipe.servings }} Portionen</span>
            </div>
          </div>

          <div class="actions">
            <button class="icon-btn" @click="toggleFavorite" :disabled="favLoading">
              <span class="icon" aria-hidden="true">{{ isFavorite ? '♥' : '♡' }}</span>
              <span>{{ isFavorite ? 'Favorit' : 'Favorisieren' }}</span>
            </button>

            <button class="icon-btn primary" @click="downloadPdf" :disabled="pdfLoading">
              <span class="icon" aria-hidden="true">⤓</span>
              <span>{{ pdfLoading ? 'Lädt…' : 'PDF' }}</span>
            </button>
          </div>
        </div>

        <div class="meta-line" v-if="hasNutrition">
          <div class="nutri-pill" v-if="recipe.nutrition?.caloriesKcal != null">
            <strong>{{ recipe.nutrition.caloriesKcal }}</strong><span>kcal</span>
          </div>
          <div class="nutri-pill" v-if="recipe.nutrition?.proteinG != null">
            <strong>{{ recipe.nutrition.proteinG }}</strong><span>Protein</span>
          </div>
          <div class="nutri-pill" v-if="recipe.nutrition?.fatG != null">
            <strong>{{ recipe.nutrition.fatG }}</strong><span>Fett</span>
          </div>
          <div class="nutri-pill" v-if="recipe.nutrition?.carbsG != null">
            <strong>{{ recipe.nutrition.carbsG }}</strong><span>Kohlenh.</span>
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
            <div class="servings" v-if="recipe.servings != null">
              <span>für</span>
              <strong>{{ recipe.servings }}</strong>
              <span>Portionen</span>
            </div>
          </div>

          <ul class="ingredients" v-if="(recipe.ingredients?.length ?? 0) > 0">
            <li v-for="ing in recipe.ingredients" :key="String(ing.id ?? ing.name)">
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
              <strong>{{ recipe.nutrition?.caloriesKcal ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Protein (g)</span>
              <strong>{{ recipe.nutrition?.proteinG ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Fett (g)</span>
              <strong>{{ recipe.nutrition?.fatG ?? '—' }}</strong>
            </div>
            <div class="nutri">
              <span>Kohlenhydrate (g)</span>
              <strong>{{ recipe.nutrition?.carbsG ?? '—' }}</strong>
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
import { fetchRecipeById, fetchMyFavoriteIds, addFavorite, removeFavorite, downloadRecipePdf } from '@/api/recipes.api'
import { useAuthStore } from '@/stores/auth.store'

// ✅ lokale Bilder
import spaghettiImg from '@/assets/recipe-fallbacks/spaghetti.png'
import veggieImg from '@/assets/recipe-fallbacks/veggie-bowl.png'
import pancakesImg from '@/assets/recipe-fallbacks/pancakes.png'

const route = useRoute()
const auth = useAuthStore()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const error = ref('')

const isFavorite = ref(false)
const favLoading = ref(false)
const pdfLoading = ref(false)

function categoryLabel(cat: string) {
  const c = cat.trim().toLowerCase()
  const map: Record<string, string> = {
    pasta: 'Pasta',
    healthy: 'Gesund',
    dessert: 'Dessert',
  }
  return map[c] ?? cat
}

// ✅ immer lokale Bilder (wie auf der Liste)
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

// ✅ ausführlicher: wir zerlegen instructions in Schritte + Absätze
const steps = computed(() => {
  const raw = (recipe.value?.instructions || '').trim()
  if (!raw) return []

  // Split nach Zeilen, entferne leere
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Versuche "1) ..." / "1." zu erkennen
  const out: Array<{ title: string; paragraphs: string[] }> = []
  for (const line of lines) {
    const cleaned = line.replace(/^\d+\s*[\)\.:-]\s*/, '').trim()
    if (!cleaned) continue

    // etwas “ausführlicher”: Ergänze Mini-Hinweise
    const paragraphs = [
      cleaned,
      // kleine, harmlose Zusatz-Hilfe (wir “erfinden” keine Zutaten, nur Koch-Logik)
      cleaned.toLowerCase().includes('kochen') ? 'Achte darauf, die Garzeit zu testen und zwischendurch umzurühren.' : '',
      cleaned.toLowerCase().includes('anbraten') ? 'Bei mittlerer bis hoher Hitze anbraten, bis Röstaromen entstehen.' : '',
    ].filter(Boolean)

    out.push({
      title: cleaned,
      paragraphs,
    })
  }

  // Fallback, falls alles in einer Zeile steht:
  if (!out.length && raw) {
    return [{ title: 'Zubereitung', paragraphs: [raw] }]
  }

  return out
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    recipe.value = await fetchRecipeById(id)

    // Favoritenstatus nur wenn eingeloggt
    await auth.fetchMe()
    if (auth.isLoggedIn) {
      const ids = await fetchMyFavoriteIds()
      isFavorite.value = ids.includes(id)
    } else {
      isFavorite.value = false
    }
  } catch (e: any) {
    error.value = e?.message || 'Fehler beim Laden'
    recipe.value = null
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!recipe.value?.id) return

  if (!auth.isLoggedIn) {
    alert('Bitte zuerst einloggen, um Favoriten zu nutzen.')
    return
  }

  favLoading.value = true
  try {
    const id = Number(recipe.value.id)
    if (isFavorite.value) {
      await removeFavorite(id)
      isFavorite.value = false
    } else {
      await addFavorite(id)
      isFavorite.value = true
    }
  } catch (e: any) {
    alert(e?.message || 'Favorit konnte nicht geändert werden.')
  } finally {
    favLoading.value = false
  }
}

async function downloadPdf() {
  if (!recipe.value?.id) return
  pdfLoading.value = true
  try {
    const blob = await downloadRecipePdf(Number(recipe.value.id))
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${(recipe.value.title || 'rezept').replaceAll(' ', '_')}.pdf`
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
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 26px 18px 46px;
  color: #1f2a24;
}

/* HERO */
.hero {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.10);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(40, 40, 40, 0.08);
}

.hero-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
}

.hero-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  padding: 16px 18px 16px;
}

.hero-top {
  display: flex;
  gap: 14px;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.sub {
  margin: 6px 0 10px;
  color: rgba(31, 42, 36, 0.78);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(231, 238, 234, 0.92);
  border: 1px solid rgba(47, 93, 76, 0.22);
  color: #2f5d4c;
  font-weight: 800;
  font-size: 0.82rem;
}

.chip.soft {
  background: rgba(47, 93, 76, 0.10);
  color: #2f5d4c;
  border-color: rgba(47, 93, 76, 0.18);
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.icon-btn {
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.22);
  background: rgba(47, 93, 76, 0.08);
  color: #2f5d4c;
  padding: 0 14px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.10);
  filter: brightness(1.02);
}

.icon-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.icon-btn.primary {
  background: #2f5d4c;
  color: #fff;
}

.icon {
  font-size: 1.05rem;
  line-height: 1;
}

.meta-line {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nutri-pill {
  border-radius: 14px;
  padding: 8px 10px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255,255,255,0.55);
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
}

.nutri-pill strong {
  font-weight: 900;
}
.nutri-pill span {
  color: rgba(31, 42, 36, 0.70);
  font-size: 0.86rem;
}

/* CONTENT */
.content {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  gap: 14px;
}

.panel {
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 18px 40px rgba(0,0,0,0.06);
  padding: 16px;
}

.panel.error {
  border-color: rgba(180, 60, 60, 0.25);
  background: rgba(180, 60, 60, 0.08);
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-head.row {
  align-items: center;
}

.panel h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
}

.muted {
  margin: 0;
  color: rgba(31, 42, 36, 0.70);
}

.steps {
  display: grid;
  gap: 10px;
}

.step {
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255,255,255,0.65);
  padding: 10px 12px;
}

.step summary {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  list-style: none;
}

.step summary::-webkit-details-marker {
  display: none;
}

.step-num {
  font-weight: 900;
  color: #2f5d4c;
  background: rgba(47, 93, 76, 0.10);
  border: 1px solid rgba(47, 93, 76, 0.18);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.82rem;
  white-space: nowrap;
}

.step-title {
  font-weight: 800;
}

.step-body {
  margin-top: 8px;
  color: rgba(31, 42, 36, 0.80);
  line-height: 1.45;
}

.step-body p {
  margin: 0 0 8px;
}
.step-body p:last-child {
  margin-bottom: 0;
}

.side {
  display: grid;
  gap: 14px;
}

.servings {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: rgba(31, 42, 36, 0.75);
}

.ingredients {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.ingredients li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255,255,255,0.65);
}

.ing-left {
  font-weight: 800;
}
.ing-right {
  color: rgba(31, 42, 36, 0.75);
  font-weight: 700;
  white-space: nowrap;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.nutri {
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255,255,255,0.65);
  padding: 12px;
}
.nutri span {
  display: block;
  color: rgba(31, 42, 36, 0.70);
  font-weight: 700;
  font-size: 0.88rem;
}
.nutri strong {
  display: block;
  margin-top: 4px;
  font-size: 1.15rem;
  font-weight: 900;
  color: #1f2a24;
}

.empty {
  color: rgba(31, 42, 36, 0.75);
}

@media (max-width: 980px) {
  .hero-img { height: 220px; }
  .hero-top { flex-direction: column; }
  .actions { justify-content: flex-start; }
  .content { grid-template-columns: 1fr; }
}
</style>
