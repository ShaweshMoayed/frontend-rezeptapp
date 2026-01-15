<!-- src/views/EditRecipeView.vue -->
<template>
  <section class="page">
    <div v-if="loading" class="panel"><p>Lädt…</p></div>

    <div v-else-if="error" class="panel error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="hero">
      <div class="hero-card">
        <div class="head">
          <div>
            <h1 class="title">Rezept bearbeiten</h1>
            <p class="sub">Ändere die Felder und speichere unten rechts.</p>
          </div>

          <div class="head-actions">
            <button class="btn danger" type="button" @click="onDelete" :disabled="deleting">
              {{ deleting ? 'Löscht…' : 'Löschen' }}
            </button>
          </div>
        </div>

        <!-- ✅ Alles untereinander / volle Breite -->
        <div class="stack">
          <!-- BASIS -->
          <div class="panel">
            <div class="panel-head">
              <h2>Basis</h2>
              <p class="muted">Pflicht: Name, Beschreibung</p>
            </div>

            <label class="label">
              Name *
              <input class="input" v-model="form.title" placeholder="z.B. Spaghetti Carbonara" />
            </label>

            <label class="label">
              Beschreibung *
              <textarea
                class="textarea"
                v-model="form.description"
                rows="4"
                placeholder="Kurzbeschreibung…"
              ></textarea>
            </label>

            <div class="row">
              <label class="label">
                Kategorie
                <select class="select" v-model="categorySelect">
                  <option value="">—</option>

                  <option value="Italienisch">Italienisch</option>
                  <option value="Orientalisch">Orientalisch</option>
                  <option value="Asiatisch">Asiatisch</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Mexikanisch">Mexikanisch</option>
                  <option value="Salat">Salat</option>
                  <option value="Suppe">Suppe</option>
                  <option value="Frühstück">Frühstück</option>
                  <option value="Amerikanisch">Amerikanisch</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Healthy">Healthy</option>

                  <option :value="OTHER_VALUE">Andere…</option>
                </select>
              </label>

              <label class="label">
                Zubereitungsdauer (min)
                <input class="input" type="number" min="0" v-model.number="form.prepMinutes" />
              </label>

              <label class="label">
                Portionen
                <input class="input" type="number" min="1" v-model.number="form.servings" />
              </label>
            </div>

            <!-- ✅ Custom-Kategorie -->
            <div v-if="categorySelect === OTHER_VALUE" class="other-box">
              <label class="label">
                Eigene Kategorie *
                <input
                  class="input"
                  v-model="customCategory"
                  placeholder="z.B. Indisch, Low Carb, Weihnachtsrezepte …"
                />
              </label>
              <p class="hint small">Tipp: Bitte kurz und eindeutig (max. 40 Zeichen).</p>
            </div>

            <div class="panel-head" style="margin-top: 14px">
              <h2>Bild</h2>
              <p class="muted">Upload (wird als Base64 gespeichert)</p>
            </div>

            <div class="upload">
              <input
                ref="fileEl"
                class="file-hidden"
                type="file"
                accept="image/*"
                @change="onFile"
              />

              <button class="btn secondary" type="button" @click="pickFile">
                Datei auswählen
              </button>

              <div class="file-pill" v-if="fileName">
                <span class="file-name" :title="fileName">{{ fileName }}</span>
                <button class="icon danger" type="button" @click="clearImage" title="Entfernen">✕</button>
              </div>

              <p class="hint" v-else>Keine Datei ausgewählt</p>
            </div>

            <div v-if="preview" class="preview">
              <img :src="preview" alt="Vorschau" />
              <button class="btn secondary" @click="clearImage" type="button">Bild entfernen</button>
            </div>
          </div>

          <!-- ZUTATEN -->
          <div class="panel">
            <div class="panel-head">
              <h2>Zutaten *</h2>
              <p class="muted">Mindestens 1 Zutat</p>
            </div>

            <div class="ingredients">
              <div v-for="(ing, idx) in form.ingredients" :key="idx" class="ing-row">
                <input class="input" v-model="ing.name" placeholder="Zutat (z.B. Pasta)" />
                <input class="input" v-model="ing.amount" placeholder="Menge (z.B. 200)" />
                <input class="input" v-model="ing.unit" placeholder="Einheit (z.B. g)" />
                <button class="icon danger" type="button" @click="removeIngredient(idx)" title="Entfernen">✕</button>
              </div>

              <button class="btn secondary full" type="button" @click="addIngredient">
                + Zutat hinzufügen
              </button>
            </div>
          </div>

          <!-- NÄHRWERTE -->
          <div class="panel">
            <div class="panel-head">
              <h2>Nährwerte *</h2>
              <p class="muted">Pflicht: alle vier Werte</p>
            </div>

            <div class="nutri-grid">
              <label class="label">
                Kalorien (kcal) *
                <input class="input" type="number" min="0" v-model.number="form.nutrition.caloriesKcal" />
              </label>
              <label class="label">
                Protein (g) *
                <input class="input" type="number" min="0" step="0.1" v-model.number="form.nutrition.proteinG" />
              </label>
              <label class="label">
                Fett (g) *
                <input class="input" type="number" min="0" step="0.1" v-model.number="form.nutrition.fatG" />
              </label>
              <label class="label">
                Kohlenhydrate (g) *
                <input class="input" type="number" min="0" step="0.1" v-model.number="form.nutrition.carbsG" />
              </label>
            </div>
          </div>

          <!-- STEPS -->
          <div class="panel">
            <div class="panel-head">
              <h2>Zubereitungsschritte *</h2>
              <p class="muted">Mindestens 1 Schritt</p>
            </div>

            <div class="steps">
              <details v-for="(s, idx) in form.steps" :key="idx" class="step" open>
                <summary>
                  <span class="step-num">Schritt {{ idx + 1 }}</span>
                  <input class="step-title" v-model="s.title" placeholder="Titel (optional)" />
                  <button class="icon danger" type="button" @click.prevent="removeStep(idx)" title="Entfernen">✕</button>
                </summary>

                <div class="step-body">
                  <textarea
                    class="textarea full"
                    v-model="s.text"
                    rows="4"
                    placeholder="Beschreibe den Schritt…"
                  ></textarea>
                </div>
              </details>

              <button class="btn secondary full" type="button" @click="addStep">
                + Schritt hinzufügen
              </button>
            </div>
          </div>
        </div>

        <!-- ✅ unten rechts -->
        <div class="footer">
          <button class="btn secondary" type="button" @click="goBack" :disabled="saving || deleting">
            Abbrechen
          </button>

          <button class="btn primary" type="button" @click="submit" :disabled="saving || deleting">
            {{ saving ? 'Speichert…' : 'Änderungen speichern' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Recipe } from '@/types/recipe'
import { fetchRecipeById, updateRecipe, deleteRecipe } from '@/api/recipes.api'
import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'
import { useToastStore } from '@/stores/toast.store'

type Step = { title: string; text: string }

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const recipesStore = useRecipesStore()
const toast = useToastStore()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')

const fileEl = ref<HTMLInputElement | null>(null)
const preview = ref<string>('')
const fileName = ref<string>('')

const OTHER_VALUE = '__other__'
const categorySelect = ref<string>('')
const customCategory = ref<string>('')

const recipeId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : 0
})

const form = ref({
  title: '',
  description: '',
  prepMinutes: null as number | null,
  servings: 2 as number,

  imageBase64: '' as string,

  ingredients: [{ name: '', amount: '', unit: '' }],

  nutrition: {
    caloriesKcal: null as number | null,
    proteinG: null as number | null,
    fatG: null as number | null,
    carbsG: null as number | null,
  },

  steps: [{ title: '', text: '' }] as Step[],
})

watch(categorySelect, (val) => {
  if (val !== OTHER_VALUE) customCategory.value = ''
})

const finalCategory = computed(() => {
  if (categorySelect.value === OTHER_VALUE) return customCategory.value.trim()
  return (categorySelect.value || '').trim()
})

function pickFile() {
  fileEl.value?.click()
}

function clearImage() {
  form.value.imageBase64 = ''
  preview.value = ''
  fileName.value = ''
  if (fileEl.value) fileEl.value.value = ''
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Bitte eine Bilddatei auswählen.')
    return
  }

  fileName.value = file.name

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    form.value.imageBase64 = result // data:image/...;base64,...
    preview.value = result
  }
  reader.readAsDataURL(file)
}

function addIngredient() {
  form.value.ingredients.push({ name: '', amount: '', unit: '' })
}
function removeIngredient(i: number) {
  form.value.ingredients.splice(i, 1)
  if (form.value.ingredients.length === 0) addIngredient()
}

function addStep() {
  form.value.steps.push({ title: '', text: '' })
}
function removeStep(i: number) {
  form.value.steps.splice(i, 1)
  if (form.value.steps.length === 0) addStep()
}

function buildInstructions(steps: Step[]) {
  const blocks = steps
    .map((s, idx) => {
      const n = idx + 1
      const title = (s.title || `Schritt ${n}`).trim()
      const body = (s.text || '').trim()
      return `${n}) ${title}:\n${body}`.trim()
    })
    .filter(Boolean)

  return blocks.join('\n\n')
}

function parseInstructionsToSteps(instructions: string | null | undefined): Step[] {
  const raw = (instructions || '').trim()
  if (!raw) return [{ title: '', text: '' }]

  const blocks = raw
    .split(/\n\s*\n+/g)
    .map((b) => b.trim())
    .filter(Boolean)

  const out: Step[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    const head = lines[0] ?? ''
    const m = head.match(/^(\d+)\)\s*(.*)$/)

    if (m) {
      const title = (m[2] || '').replace(/:\s*$/, '').trim()
      const body = lines.slice(1).join('\n').trim()
      out.push({ title, text: body })
    } else {
      const title = head.replace(/:\s*$/, '').trim()
      const body = lines.slice(1).join('\n').trim()
      out.push({ title, text: body })
    }
  }

  return out.length ? out : [{ title: '', text: '' }]
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width <= maxWidth) {
      line = test
    } else {
      if (line) lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function generateTitleImageDataUrl(title: string): string {
  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#2f5d4c')
  g.addColorStop(1, '#1f2a24')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(0, 0, W, H)

  const safe = (title || 'Mein Rezept').trim().slice(0, 60)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let fontSize = 72
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
  while (fontSize > 38 && ctx.measureText(safe).width > W * 0.82) {
    fontSize -= 2
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
  }

  const lines = wrapText(ctx, safe, W * 0.82)
  const lineHeight = fontSize * 1.15
  const totalHeight = lines.length * lineHeight
  let y = H / 2 - totalHeight / 2 + lineHeight / 2

  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8

  for (const line of lines) {
    ctx.fillText(line, W / 2, y)
    y += lineHeight
  }

  return canvas.toDataURL('image/png')
}

function validate(): string | null {
  const t = form.value.title.trim()
  const d = form.value.description.trim()

  if (!t) return 'Bitte einen Namen eingeben.'
  if (!d) return 'Bitte eine Beschreibung eingeben.'

  if (categorySelect.value === OTHER_VALUE) {
    const cc = customCategory.value.trim()
    if (!cc) return 'Bitte eine eigene Kategorie eingeben.'
    if (cc.length > 40) return 'Die eigene Kategorie ist zu lang (max. 40 Zeichen).'
  }

  const cleanIngredients = form.value.ingredients
    .map((i) => ({ ...i, name: (i.name || '').trim() }))
    .filter((i) => i.name.length > 0)

  if (cleanIngredients.length < 1) return 'Bitte mindestens 1 Zutat eintragen.'

  const steps = form.value.steps
    .map((s) => ({ ...s, text: (s.text || '').trim() }))
    .filter((s) => s.text.length > 0)

  if (steps.length < 1) return 'Bitte mindestens 1 Schritt ausfüllen.'

  const n = form.value.nutrition
  if (n.caloriesKcal == null || n.proteinG == null || n.fatG == null || n.carbsG == null) {
    return 'Bitte alle Nährwerte ausfüllen.'
  }

  return null
}

function ensureOwnerOrThrow(r: Recipe) {
  const me = (auth.user?.username || '').trim().toLowerCase()
  const owner = (r.createdByUsername || '').trim().toLowerCase()
  if (!me || !owner || me !== owner) {
    throw new Error('forbidden')
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const id = recipeId.value
    if (!id) throw new Error('Ungültige ID')

    if (auth.token && !auth.user) {
      await auth.fetchMe()
    }

    const r = await fetchRecipeById(id)
    ensureOwnerOrThrow(r)

    form.value.title = r.title || ''
    form.value.description = r.description || ''
    form.value.prepMinutes = r.prepMinutes ?? null
    form.value.servings = r.servings ?? 2

    const b64 = (r.imageBase64 || '').trim()
    form.value.imageBase64 = b64
    preview.value = b64 ? b64 : ''
    fileName.value = b64 ? 'Vorhandenes Bild' : ''

    const ings = (r.ingredients || []).map((i) => ({
      name: (i.name || '').trim(),
      amount: i.amount ?? '',
      unit: i.unit ?? '',
    }))
    form.value.ingredients = ings.length ? ings : [{ name: '', amount: '', unit: '' }]

    form.value.nutrition.caloriesKcal = r.nutrition?.caloriesKcal ?? null
    form.value.nutrition.proteinG = r.nutrition?.proteinG ?? null
    form.value.nutrition.fatG = r.nutrition?.fatG ?? null
    form.value.nutrition.carbsG = r.nutrition?.carbsG ?? null

    form.value.steps = parseInstructionsToSteps(r.instructions)

    const cat = (r.category || '').trim()
    const presets = new Set([
      '',
      'Italienisch',
      'Orientalisch',
      'Asiatisch',
      'Vegan',
      'Mexikanisch',
      'Salat',
      'Suppe',
      'Frühstück',
      'Amerikanisch',
      'Dessert',
      'Healthy',
    ])
    if (presets.has(cat)) {
      categorySelect.value = cat
      customCategory.value = ''
    } else if (cat) {
      categorySelect.value = OTHER_VALUE
      customCategory.value = cat
    } else {
      categorySelect.value = ''
      customCategory.value = ''
    }
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase()
    if (msg.includes('forbidden')) {
      error.value = 'Du darfst dieses Rezept nicht bearbeiten.'
    } else {
      error.value = e?.message || 'Fehler beim Laden'
    }
  } finally {
    loading.value = false
  }
}

async function submit() {
  const err = validate()
  if (err) {
    toast.error(err)
    return
  }

  saving.value = true
  try {
    const cleanIngredients = form.value.ingredients
      .map((i) => ({
        name: (i.name || '').trim(),
        amount: (i.amount || '').trim() || null,
        unit: (i.unit || '').trim() || null,
      }))
      .filter((i) => i.name.length > 0)

    const cleanSteps = form.value.steps
      .map((s) => ({ title: (s.title || '').trim(), text: (s.text || '').trim() }))
      .filter((s) => s.text.length > 0)

    const cat = finalCategory.value

    let imageBase64 = (form.value.imageBase64 || '').trim()
    if (!imageBase64) {
      imageBase64 = generateTitleImageDataUrl(form.value.title.trim())
      form.value.imageBase64 = imageBase64
      preview.value = imageBase64
      fileName.value = 'Standardbild (automatisch)'
    }

    const payload: Partial<Recipe> = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      category: cat ? cat : null,

      prepMinutes: form.value.prepMinutes ?? null,
      servings: form.value.servings ?? null,

      imageBase64: imageBase64 || null,

      ingredients: cleanIngredients,
      nutrition: {
        caloriesKcal: form.value.nutrition.caloriesKcal!,
        proteinG: form.value.nutrition.proteinG!,
        fatG: form.value.nutrition.fatG!,
        carbsG: form.value.nutrition.carbsG!,
      },

      instructions: buildInstructions(cleanSteps),
    }

    await updateRecipe(recipeId.value, payload)

    toast.success('Änderungen gespeichert.')

    await recipesStore.refresh()
    await recipesStore.loadCategories()

    router.push({ name: 'recipe-detail', params: { id: recipeId.value } })
  } catch (e: any) {
    toast.error(e?.message || 'Änderungen konnten nicht gespeichert werden.')
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  const ok = await toast.confirm('Willst du dieses Rezept wirklich löschen?', {
    type: 'error',
    confirmText: 'Löschen',
    cancelText: 'Abbrechen',
  })
  if (!ok) return

  deleting.value = true
  try {
    await deleteRecipe(recipeId.value)
    toast.success('Rezept gelöscht.')

    await recipesStore.refresh()
    await recipesStore.loadCategories()

    router.push({ name: 'recipes' })
  } catch (e: any) {
    toast.error(e?.message || 'Rezept konnte nicht gelöscht werden.')
  } finally {
    deleting.value = false
  }
}

function goBack() {
  router.push({ name: 'recipe-detail', params: { id: recipeId.value } })
}

onMounted(load)
</script>

<style scoped>
/* (dein bestehendes CSS unverändert) */
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 26px 18px 46px;
  color: #1f2a24;
}

.hero { display: flex; justify-content: center; margin-top: 10px; }

.hero-card {
  width: 100%;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(40, 40, 40, 0.08);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.title { margin: 0; font-size: 1.8rem; font-weight: 900; }
.sub { margin: 6px 0 0; color: rgba(31, 42, 36, 0.75); }

.stack { display: grid; gap: 14px; }

.panel {
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 18px 40px rgba(0,0,0,0.06);
  padding: 16px;
}
.panel.error { border-color: rgba(180, 60, 60, 0.25); background: rgba(180, 60, 60, 0.08); }

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel h2 { margin: 0; font-size: 1.15rem; font-weight: 900; }
.muted { margin: 0; color: rgba(31, 42, 36, 0.70); }

.label {
  display: grid;
  gap: 6px;
  font-weight: 800;
  color: rgba(31, 42, 36, 0.9);
  margin-bottom: 10px;
}

.input, .select, .textarea, .step-title {
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  outline: none;
  width: 100%;
}

.input, .select { height: 44px; padding: 0 14px; }
.textarea { padding: 10px 14px; resize: vertical; }
.textarea.full { width: 100%; }

.row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.other-box {
  margin-top: 10px;
  border-radius: 16px;
  border: 1px dashed rgba(40, 40, 40, 0.16);
  background: rgba(255, 255, 255, 0.40);
  padding: 12px;
}
.hint { margin: 0; color: rgba(31, 42, 36, 0.65); font-weight: 700; }
.hint.small { font-size: 0.9rem; }

/* Upload */
.upload {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}
.file-hidden { display: none; }

.file-pill {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 999px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 8px 10px 8px 12px;
  min-height: 44px;
}

.file-name {
  font-weight: 800;
  color: rgba(31, 42, 36, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.preview { margin-top: 10px; display: grid; gap: 10px; }
.preview img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.10);
}

/* Zutaten */
.ingredients { display: grid; gap: 10px; }
.ing-row {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.7fr auto;
  gap: 8px;
  align-items: center;
}

/* Nährwerte */
.nutri-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Steps */
.steps { display: grid; gap: 10px; }
.step {
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255,255,255,0.65);
  padding: 10px 12px;
}
.step summary {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  list-style: none;
}
.step summary::-webkit-details-marker { display: none; }
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
.step-title { height: 44px; padding: 0 12px; font-weight: 800; }
.step-body { margin-top: 10px; }

/* Buttons */
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
.btn:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0,0,0,0.10); filter: brightness(1.03); }
.btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
.btn.secondary { background: rgba(47, 93, 76, 0.10); color: #2f5d4c; }
.btn.primary { background: #2f5d4c; color: #fff; }
.btn.danger { border-color: rgba(160, 60, 60, 0.35); background: rgba(160, 60, 60, 0.10); color: rgba(120, 30, 30, 0.95); }
.btn.full { width: 100%; justify-content: center; }

.icon {
  height: 34px;
  width: 34px;
  border-radius: 999px;
  border: 1px solid rgba(40,40,40,0.12);
  background: rgba(255,255,255,0.70);
  cursor: pointer;
  font-weight: 900;
}
.icon.danger { color: rgba(140, 40, 40, 0.95); }

.footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

@media (max-width: 980px) {
  .row { grid-template-columns: 1fr; }
  .nutri-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .ing-row { grid-template-columns: 1fr; }
  .upload { grid-template-columns: 1fr; }
  .file-pill { width: 100%; }
}
</style>
