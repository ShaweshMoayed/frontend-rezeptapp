<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import NutritionChart from '@/components/NutritionChart.vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { fetchRecipes } from '@/api/recipes.api'
import { fetchStats } from '@/api/stats.api'
import type { Recipe } from '@/types/recipe'

const store = useRecipesStore()
const auth = useAuthStore()
const toast = useToastStore()

const loading = ref(false)
const compareLoading = ref(false)

const allRecipes = ref<Recipe[]>([])
const selectedA = ref<number | ''>('')
const selectedB = ref<number | ''>('')

const compareMode = ref<'radar' | 'bar'>('radar')

function normalize(s: string) {
  return (s ?? '').trim().toLowerCase()
}

function categoryLabel(raw: string) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return '—'
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
    salat: 'Salat',
    grill: 'Grill',
    snack: 'Snack',
  }
  return map[key] ?? (trimmed.charAt(0).toUpperCase() + trimmed.slice(1))
}

function asNum(n: any): number {
  const x = Number(n)
  return Number.isFinite(x) ? x : 0
}

function macroOf(r: Recipe) {
  const n = r.nutrition || {}
  return {
    calories: asNum(n.caloriesKcal),
    protein: asNum(n.proteinG),
    fat: asNum(n.fatG),
    carbs: asNum(n.carbsG),
  }
}

function uniqById(list: Recipe[]) {
  const m = new Map<number, Recipe>()
  for (const r of list) {
    const id = Number(r.id)
    if (!Number.isFinite(id)) continue
    if (!m.has(id)) m.set(id, r)
  }
  return Array.from(m.values())
}

const recipeOptions = computed(() => {
  return [...allRecipes.value]
    .filter((r) => r.id != null)
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
})

function ensureDefaultCompareSelection() {
  const opts = recipeOptions.value
  if (!opts.length) return

  // A setzen, falls leer/ungültig
  const aNum = selectedA.value === '' ? 0 : Number(selectedA.value)
  if (!aNum || !opts.some((r) => Number(r.id) === aNum)) {
    const first = opts.find((r) => r.id != null)
    if (first?.id != null) selectedA.value = Number(first.id)
  }

  // B setzen, falls leer/ungültig oder gleich wie A
  const aFinal = selectedA.value === '' ? 0 : Number(selectedA.value)
  const bNum = selectedB.value === '' ? 0 : Number(selectedB.value)

  const bIsValid =
    bNum &&
    opts.some((r) => Number(r.id) === bNum) &&
    bNum !== aFinal

  if (!bIsValid) {
    const second = opts.find((r) => r.id != null && Number(r.id) !== aFinal)
    selectedB.value = second?.id != null ? Number(second.id) : ''
  }
}

async function loadAllForStats() {
  if (!auth.isLoggedIn) {
    toast.info('Bitte einloggen, um Statistiken zu nutzen.')
    return
  }

  loading.value = true
  try {
    const visible = await fetchRecipes({ search: '', category: '' })

    // eigene Rezepte extra laden (damit Kategorie-Statistik sicher deine enthält)
    let mine: Recipe[] = []
    try {
      mine = await fetchRecipes({ search: '', category: '__mine__' })
    } catch {
      mine = []
    }

    allRecipes.value = uniqById([...(visible || []), ...(mine || [])])

    // Favoriten für Donut
    await store.loadFavoriteIds()

    // ✅ hier: sauber A/B initialisieren (ohne [0]/[1])
    ensureDefaultCompareSelection()
  } catch (e: any) {
    toast.error(e?.message || 'Statistiken konnten nicht geladen werden.')
    allRecipes.value = []
  } finally {
    loading.value = false
  }
}

/** 1) Rezepte pro Kategorie */
const recipesPerCategory = computed(() => {
  const map = new Map<string, number>()
  for (const r of allRecipes.value) {
    const raw = (r.category ?? '').trim()
    const key = raw ? categoryLabel(raw) : '—'
    map.set(key, (map.get(key) || 0) + 1)
  }
  const labels = Array.from(map.keys()).sort((a, b) => a.localeCompare(b))
  const data = labels.map((l) => map.get(l) || 0)
  return { labels, data }
})

/** 2) Durchschnittliche Nährwerte pro Kategorie */
const avgMacrosPerCategory = computed(() => {
  const buckets = new Map<string, { c: number; p: number; f: number; cb: number; n: number }>()
  for (const r of allRecipes.value) {
    const cat = (r.category ?? '').trim()
    const key = cat ? categoryLabel(cat) : '—'
    const m = macroOf(r)
    const b = buckets.get(key) || { c: 0, p: 0, f: 0, cb: 0, n: 0 }
    b.c += m.calories
    b.p += m.protein
    b.f += m.fat
    b.cb += m.carbs
    b.n += 1
    buckets.set(key, b)
  }

  const labels = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b))
  const kcal = labels.map((k) => {
    const b = buckets.get(k)!
    return b.n ? Math.round(b.c / b.n) : 0
  })
  const protein = labels.map((k) => {
    const b = buckets.get(k)!
    return b.n ? Math.round((b.p / b.n) * 10) / 10 : 0
  })
  const fat = labels.map((k) => {
    const b = buckets.get(k)!
    return b.n ? Math.round((b.f / b.n) * 10) / 10 : 0
  })
  const carbs = labels.map((k) => {
    const b = buckets.get(k)!
    return b.n ? Math.round((b.cb / b.n) * 10) / 10 : 0
  })

  return { labels, kcal, protein, fat, carbs }
})

/** 3) Top 5 nach Kalorien */
const top5Calories = computed(() => {
  const sorted = [...allRecipes.value]
    .map((r) => ({ r, kcal: macroOf(r).calories }))
    .filter((x) => x.kcal > 0 && x.r.id != null)
    .sort((a, b) => b.kcal - a.kcal)
    .slice(0, 5)

  const labels = sorted.map((x) => x.r.title || `#${x.r.id}`)
  const data = sorted.map((x) => x.kcal)
  return { labels, data }
})

/** 4) Favoriten vs Nicht-Favoriten */
const favoritesSplit = computed(() => {
  const ids = new Set(store.favoriteIds.map(Number))
  let fav = 0
  let other = 0
  for (const r of allRecipes.value) {
    const id = Number(r.id)
    if (!Number.isFinite(id)) continue
    if (ids.has(id)) fav++
    else other++
  }
  return { fav, other }
})

/** Vergleich (2 Rezepte) */
const compareData = ref<{
  labels: string[]
  datasets: Array<{ label: string; data: number[] }>
} | null>(null)

async function loadCompare() {
  compareData.value = null
  const a = selectedA.value ? Number(selectedA.value) : 0
  const b = selectedB.value ? Number(selectedB.value) : 0
  if (!a || !b || a === b) return

  compareLoading.value = true
  try {
    const res = await fetchStats([a, b])
    const r1 = res.recipes?.[0]
    const r2 = res.recipes?.[1]
    if (!r1 || !r2) return

    const labels = ['Kalorien', 'Protein (g)', 'Fett (g)', 'Carbs (g)']
    compareData.value = {
      labels,
      datasets: [
        {
          label: r1.title,
          data: [
            asNum(r1.macro.caloriesKcal),
            asNum(r1.macro.proteinG),
            asNum(r1.macro.fatG),
            asNum(r1.macro.carbsG),
          ],
        },
        {
          label: r2.title,
          data: [
            asNum(r2.macro.caloriesKcal),
            asNum(r2.macro.proteinG),
            asNum(r2.macro.fatG),
            asNum(r2.macro.carbsG),
          ],
        },
      ],
    }
  } catch (e: any) {
    toast.error(e?.message || 'Vergleich konnte nicht geladen werden.')
  } finally {
    compareLoading.value = false
  }
}

function swapCompare() {
  const tmp = selectedA.value
  selectedA.value = selectedB.value
  selectedB.value = tmp
}

watch([selectedA, selectedB, compareMode], () => loadCompare())

onMounted(async () => {
  if (!auth.isLoggedIn) {
    toast.info('Bitte einloggen, um Statistiken zu nutzen.')
    return
  }
  await loadAllForStats()
  await loadCompare()
})
</script>

<template>
  <section class="page">
    <header class="head">
      <div>
        <h1>Rezept-Statistiken</h1>
        <p>Charts basierend auf deinen Rezepten.</p>
      </div>

      <div class="head-actions">
        <button class="btn secondary" @click="loadAllForStats" :disabled="loading">
          {{ loading ? 'Lädt…' : 'Neu laden' }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="panel">
      <p>Lädt Statistiken…</p>
    </div>

    <div v-else-if="allRecipes.length === 0" class="panel">
      <p class="muted">Keine Rezepte gefunden. Erstelle zuerst ein Rezept.</p>
    </div>

    <div v-else class="stack">
      <!-- 1) Kategorien -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Kategorienübersicht</h2>
            <p class="muted">Wie viele Rezepte du pro Kategorie hast.</p>
          </div>
        </div>

        <NutritionChart
          type="bar"
          title="Rezepte pro Kategorie"
          :labels="recipesPerCategory.labels"
          :datasets="[{ label: 'Rezepte', data: recipesPerCategory.data }]"
          :height="320"
        />
      </div>

      <!-- 2) Avg Nutrition pro Kategorie -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Ø Nährwerte pro Kategorie</h2>
            <p class="muted">Durchschnittliche kcal / Protein / Fett / Carbs je Kategorie.</p>
          </div>
        </div>

        <NutritionChart
          type="bar"
          title="Durchschnittswerte je Kategorie"
          :labels="avgMacrosPerCategory.labels"
          :datasets="[
            { label: 'kcal', data: avgMacrosPerCategory.kcal },
            { label: 'Protein', data: avgMacrosPerCategory.protein },
            { label: 'Fett', data: avgMacrosPerCategory.fat },
            { label: 'Carbs', data: avgMacrosPerCategory.carbs },
          ]"
          :height="360"
        />
      </div>

      <!-- 3) Top 5 calories -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Top 5 nach Kalorien</h2>
            <p class="muted">Die kalorienreichsten Rezepte (wenn kcal gepflegt sind).</p>
          </div>
        </div>

        <div v-if="top5Calories.labels.length === 0" class="panel-inner">
          <p class="muted">Keine Kaloriendaten verfügbar.</p>
        </div>

        <NutritionChart
          v-else
          type="bar"
          title="Top 5 Rezepte (kcal)"
          :labels="top5Calories.labels"
          :datasets="[{ label: 'kcal', data: top5Calories.data }]"
          :height="320"
        />
      </div>

      <!-- 4) Favorites donut -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Favoriten vs. Nicht-Favoriten</h2>
            <p class="muted">Interaktiv: Hover zeigt die Werte.</p>
          </div>
        </div>

        <NutritionChart
          type="doughnut"
          title="Favoriten-Verteilung"
          :labels="['Favoriten', 'Andere']"
          :datasets="[{ label: 'Anzahl', data: [favoritesSplit.fav, favoritesSplit.other] }]"
          :height="320"
        />

        <div class="hint-row">
          <span class="pill">Favoriten: <strong>{{ favoritesSplit.fav }}</strong></span>
          <span class="pill soft">Andere: <strong>{{ favoritesSplit.other }}</strong></span>
        </div>
      </div>

      <!-- 5) Vergleich -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Rezeptvergleich</h2>
            <p class="muted">Wähle zwei Rezepte und vergleiche ihre Nährwerte.</p>
          </div>

          <div class="compare-actions">
            <button class="btn secondary" type="button" @click="swapCompare" :disabled="compareLoading">
              ⇄ Tauschen
            </button>

            <button
              class="btn secondary"
              type="button"
              @click="compareMode = compareMode === 'radar' ? 'bar' : 'radar'"
              :disabled="compareLoading"
            >
              Ansicht: {{ compareMode === 'radar' ? 'Radar' : 'Bar' }}
            </button>
          </div>
        </div>

        <div class="compare-row">
          <label class="label">
            Rezept A
            <select class="select" v-model="selectedA">
              <option value="">— Bitte wählen —</option>
              <option v-for="r in recipeOptions" :key="String(r.id)" :value="Number(r.id)">
                {{ r.title }}
              </option>
            </select>
          </label>

          <label class="label">
            Rezept B
            <select class="select" v-model="selectedB">
              <option value="">— Bitte wählen —</option>
              <option v-for="r in recipeOptions" :key="String(r.id)" :value="Number(r.id)">
                {{ r.title }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="compareLoading" class="panel-inner">
          <p>Lädt Vergleich…</p>
        </div>

        <div v-else-if="!compareData" class="panel-inner">
          <p class="muted">Bitte zwei unterschiedliche Rezepte auswählen.</p>
        </div>

        <NutritionChart
          v-else
          :type="compareMode"
          title="Nährwerte-Vergleich"
          :labels="compareData.labels"
          :datasets="compareData.datasets"
          :height="360"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 18px 44px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 14px;
  margin-bottom: 14px;
}

h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #1f2a24;
}
.head p {
  margin: 6px 0 0;
  color: rgba(31, 42, 36, 0.75);
  font-weight: 700;
}

.head-actions {
  display: flex;
  gap: 10px;
}

.stack {
  display: grid;
  gap: 14px;
}

.card {
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 18px 40px rgba(0,0,0,0.05);
  padding: 14px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  margin-bottom: 10px;
}

.card h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 900;
  color: #1f2a24;
}

.muted {
  margin: 6px 0 0;
  color: rgba(31, 42, 36, 0.70);
  font-weight: 700;
}

.panel {
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 18px 40px rgba(0,0,0,0.06);
  padding: 16px;
}

.panel-inner {
  border-radius: 16px;
  border: 1px dashed rgba(40, 40, 40, 0.16);
  background: rgba(255, 255, 255, 0.40);
  padding: 14px;
  margin-top: 10px;
}

.btn {
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.25);
  background: #2f5d4c;
  color: #fff;
  font-weight: 900;
  padding: 0 16px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0, 0, 0, 0.10); filter: brightness(1.03); }
.btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
.btn.secondary { background: rgba(47, 93, 76, 0.10); color: #2f5d4c; }

.compare-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0 6px;
}

.label {
  display: grid;
  gap: 6px;
  font-weight: 900;
  color: rgba(31, 42, 36, 0.9);
}

.select {
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 0 14px;
  outline: none;
}
.select:focus {
  border-color: rgba(47, 93, 76, 0.35);
  box-shadow: 0 0 0 4px rgba(47, 93, 76, 0.14);
}

.hint-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.pill {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(47, 93, 76, 0.22);
  background: rgba(47, 93, 76, 0.10);
  color: #2f5d4c;
  font-weight: 900;
}
.pill.soft {
  background: rgba(255, 255, 255, 0.55);
  color: rgba(31, 42, 36, 0.85);
  border-color: rgba(0,0,0,0.10);
}

@media (max-width: 860px) {
  .head { flex-direction: column; align-items: start; }
  .compare-row { grid-template-columns: 1fr; }
}
</style>
