<template>
  <section class="page">
    <div class="hero">
      <div class="hero-card">
        <div class="head">
          <div>
            <h1 class="title">Rezept erstellen</h1>
            <p class="sub">Fülle die Felder aus und speichere dein Rezept.</p>
          </div>

          <button class="btn primary" @click="submit" :disabled="saving">
            {{ saving ? 'Speichert…' : 'Rezept speichern' }}
          </button>
        </div>

        <div class="grid">
          <!-- LEFT -->
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
              <textarea class="textarea" v-model="form.description" rows="4" placeholder="Kurzbeschreibung…"></textarea>
            </label>

            <div class="row">
              <label class="label">
                Kategorie
                <select class="select" v-model="form.category">
                  <option value="">—</option>
                  <option value="pasta">Pasta</option>
                  <option value="healthy">Gesund</option>
                  <option value="dessert">Dessert</option>
                  <option value="other">Sonstiges</option>
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

            <div class="panel-head" style="margin-top: 14px">
              <h2>Bild</h2>
              <p class="muted">Upload (wird als Base64 gespeichert)</p>
            </div>

            <input class="file" type="file" accept="image/*" @change="onFile" />

            <div v-if="preview" class="preview">
              <img :src="preview" alt="Vorschau" />
              <button class="btn secondary" @click="clearImage" type="button">Bild entfernen</button>
            </div>
          </div>

          <!-- RIGHT -->
          <aside class="side">
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

                <button class="btn secondary" type="button" @click="addIngredient">+ Zutat hinzufügen</button>
              </div>
            </div>

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
          </aside>
        </div>

        <!-- STEPS -->
        <div class="panel" style="margin-top: 14px">
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
                  class="textarea"
                  v-model="s.text"
                  rows="3"
                  placeholder="Beschreibe den Schritt…"
                ></textarea>
              </div>
            </details>

            <button class="btn secondary" type="button" @click="addStep">+ Schritt hinzufügen</button>
          </div>
        </div>

        <div class="footer">
          <button class="btn primary" @click="submit" :disabled="saving">
            {{ saving ? 'Speichert…' : 'Rezept speichern' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { useRecipesStore } from '@/stores/recipes.store'
import { createRecipe } from '@/api/recipes.api'
import type { Recipe } from '@/types/recipe'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const recipesStore = useRecipesStore()

const saving = ref(false)
const preview = ref<string>('')

type Step = { title: string; text: string }

const form = ref({
  title: '',
  description: '',
  category: '',
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

function clearImage() {
  form.value.imageBase64 = ''
  preview.value = ''
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Bitte eine Bilddatei auswählen.')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    form.value.imageBase64 = result // data:image/...;base64,...
    preview.value = result
  }
  reader.readAsDataURL(file)
}

function buildInstructions(steps: Step[]) {
  // Format wie Seeder/Detailparser: "1) Titel:\nText\n\n2) ..."
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

function validate(): string | null {
  const t = form.value.title.trim()
  const d = form.value.description.trim()

  if (!t) return 'Bitte einen Namen eingeben.'
  if (!d) return 'Bitte eine Beschreibung eingeben.'

  const cleanIngredients = form.value.ingredients
    .map((i) => ({ ...i, name: (i.name || '').trim() }))
    .filter((i) => i.name.length > 0)

  if (cleanIngredients.length < 1) return 'Bitte mindestens 1 Zutat eintragen.'

  const steps = form.value.steps
    .map((s) => ({ ...s, text: (s.text || '').trim() }))
    .filter((s) => s.text.length > 0)

  if (steps.length < 1) return 'Bitte mindestens 1 Schritt ausfüllen.'

  const n = form.value.nutrition
  if (
    n.caloriesKcal == null ||
    n.proteinG == null ||
    n.fatG == null ||
    n.carbsG == null
  ) {
    return 'Bitte alle Nährwerte ausfüllen.'
  }

  return null
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

    const payload: Recipe = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      category: form.value.category.trim() || null,
      prepMinutes: form.value.prepMinutes ?? null,
      servings: form.value.servings ?? null,

      imageBase64: form.value.imageBase64 || null,

      ingredients: cleanIngredients,
      nutrition: {
        caloriesKcal: form.value.nutrition.caloriesKcal!,
        proteinG: form.value.nutrition.proteinG!,
        fatG: form.value.nutrition.fatG!,
        carbsG: form.value.nutrition.carbsG!,
      },

      instructions: buildInstructions(cleanSteps),
    }

    const created = await createRecipe(payload)

    toast.success('Rezept erstellt.')

    // ✅ Liste aktualisieren
    await recipesStore.refresh()
    await recipesStore.loadCategories()

    const redirect = (route.query.redirect as string) || `/rezepte/${created.id}`
    router.push(redirect)
  } catch (e: any) {
    toast.error(e?.message || 'Rezept konnte nicht erstellt werden.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 26px 18px 46px; color: #1f2a24; }

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

.grid { display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 14px; }

.panel {
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.08);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 18px 40px rgba(0,0,0,0.06);
  padding: 16px;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel h2 { margin: 0; font-size: 1.15rem; font-weight: 900; }
.muted { margin: 0; color: rgba(31, 42, 36, 0.70); }

.label { display: grid; gap: 6px; font-weight: 800; color: rgba(31, 42, 36, 0.9); margin-bottom: 10px; }
.input, .select, .textarea {
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 0 14px;
  outline: none;
}
.input, .select { height: 44px; }
.textarea { padding: 10px 14px; resize: vertical; }

.row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

.file { width: 100%; }

.preview { margin-top: 10px; display: grid; gap: 10px; }
.preview img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid rgba(40, 40, 40, 0.10);
}

.side { display: grid; gap: 14px; }

.ingredients { display: grid; gap: 10px; }
.ing-row { display: grid; grid-template-columns: 1.4fr 0.7fr 0.7fr auto; gap: 8px; align-items: center; }

.nutri-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

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

.step-title {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(40, 40, 40, 0.10);
  background: rgba(255,255,255,0.65);
  padding: 0 12px;
  font-weight: 800;
  outline: none;
}

.step-body { margin-top: 10px; }

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

.footer { display: flex; justify-content: flex-end; margin-top: 14px; }

@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
  .row { grid-template-columns: 1fr; }
  .ing-row { grid-template-columns: 1fr 1fr 1fr auto; }
}
@media (max-width: 640px) {
  .ing-row { grid-template-columns: 1fr; }
}
</style>
