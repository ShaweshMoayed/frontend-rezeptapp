<!-- src/views/MealPlanView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { useToastStore } from '@/stores/toast.store'
import { exportPlanPdf, type CreatePlanRequest } from '@/api/plans.api'

type Slot = 'BREAKFAST' | 'LUNCH' | 'DINNER'
type DaySlots = { BREAKFAST: number | null; LUNCH: number | null; DINNER: number | null }
type GridModel = Record<string, DaySlots>
type GridDay = { label: string; key: string }

function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
function parseIsoDate(s: string): Date {
  const [yy = '1970', mm = '1', dd = '1'] = (s || '').split('-')
  return new Date(Number(yy), Number(mm) - 1, Number(dd))
}
function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // So=0
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
function formatDeFromIso(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

const recipesStore = useRecipesStore()
const toast = useToastStore()

const minMondayIso = toIsoDate(getMonday(new Date()))
const title = ref('Mein Wochenplan')

// ✅ Woche darf nicht in der Vergangenheit liegen
const weekStartMonday = ref<string>(minMondayIso)

// Grid state pro Tag
const gridModel = ref<GridModel>({})

function buildDays(mondayIso: string): GridDay[] {
  const monday = getMonday(parseIsoDate(mondayIso))
  const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const out: GridDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = toIsoDate(d)
    out.push({ key, label: `${labels[i]} • ${formatDeFromIso(key)}` })
  }
  return out
}

const days = computed(() => buildDays(weekStartMonday.value))

function ensureGridInitializedForWeek() {
  for (const d of days.value) {
    if (!gridModel.value[d.key]) {
      gridModel.value[d.key] = { BREAKFAST: null, LUNCH: null, DINNER: null }
    }
  }
}

function normalizeAndClampMonday() {
  // auf Montag setzen
  const monday = getMonday(parseIsoDate(weekStartMonday.value))
  let iso = toIsoDate(monday)

  // nicht älter als aktuelle Woche
  if (iso < minMondayIso) {
    iso = minMondayIso
    toast.info('Du kannst keinen Wochenplan in der Vergangenheit erstellen.')
  }

  weekStartMonday.value = iso
  ensureGridInitializedForWeek()
}

const recipeOptions = computed(() => (recipesStore.recipes || []).filter((r) => typeof r.id === 'number'))

function isDayComplete(dayKey: string): boolean {
  const slots = gridModel.value[dayKey]
  if (!slots) return false
  return slots.BREAKFAST !== null || slots.LUNCH !== null || slots.DINNER !== null
}

const allDaysComplete = computed(() => days.value.every((d) => isDayComplete(d.key)))

function setSlot(dayKey: string, slot: Slot, value: string) {
  const recipeId = value ? Number(value) : null
  const current = gridModel.value[dayKey] || { BREAKFAST: null, LUNCH: null, DINNER: null }
  gridModel.value = {
    ...gridModel.value,
    [dayKey]: { ...current, [slot]: recipeId },
  }
}

function clearDay(dayKey: string) {
  gridModel.value = {
    ...gridModel.value,
    [dayKey]: { BREAKFAST: null, LUNCH: null, DINNER: null },
  }
}

function buildEntries(): CreatePlanRequest['entries'] {
  const entries: CreatePlanRequest['entries'] = []
  const slots: Slot[] = ['BREAKFAST', 'LUNCH', 'DINNER']

  for (const d of days.value) {
    const s = gridModel.value[d.key] || { BREAKFAST: null, LUNCH: null, DINNER: null }
    for (const slot of slots) {
      entries.push({
        day: d.key,
        slot,
        recipeId: s[slot] ?? null,
        servings: null,
      })
    }
  }

  return entries
}

const exporting = ref(false)
const canExport = computed(() => !exporting.value && allDaysComplete.value)

async function onExportPdf() {
  normalizeAndClampMonday()

  if (!allDaysComplete.value) {
    toast.error('Bitte wähle für jeden Tag mindestens ein Rezept aus.')
    return
  }

  exporting.value = true
  try {
    const payload: CreatePlanRequest = {
      title: title.value.trim() || 'Wochenplan',
      weekStartMonday: weekStartMonday.value,
      entries: buildEntries(),
    }

    const blob = await exportPlanPdf(payload)
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${(payload.title || 'wochenplan').trim().replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
    toast.success('PDF wurde heruntergeladen.')
  } catch (e: any) {
    toast.error(e?.message || 'PDF konnte nicht erstellt werden.')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await recipesStore.loadRecipes()
  normalizeAndClampMonday()
})
</script>

<template>
  <main class="container page">
    <div class="head">
      <div class="titlebox">
        <div class="kicker">RezeptApp • Wochenplan</div>
        <h1>Essensplan</h1>
        <p class="sub">
          Wähle pro Tag mindestens ein Rezept aus. Dann kannst du den Plan als PDF exportieren.
        </p>
      </div>

      <div class="actions">
        <button class="btn btn2" :disabled="!canExport" @click="onExportPdf">
          {{ exporting ? 'Export…' : 'Als PDF exportieren' }}
        </button>
      </div>
    </div>

    <div class="card">
      <div class="formrow">
        <div class="field">
          <label>Titel</label>
          <input v-model="title" type="text" placeholder="z.B. Mein Wochenplan" />
        </div>

        <div class="field">
          <label>Woche ab (Montag)</label>
          <input
            v-model="weekStartMonday"
            type="date"
            :min="minMondayIso"
            @change="normalizeAndClampMonday"
          />
          <small class="hint">Nur ab aktueller Woche möglich. Datum wird automatisch auf Montag gesetzt.</small>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Plan</h2>

      <div v-if="recipesStore.loading" class="muted">Rezepte werden geladen…</div>
      <div v-else-if="recipesStore.error" class="muted">{{ recipesStore.error }}</div>

      <div v-else class="list">
        <section v-for="day in days" :key="day.key" class="day-row">
          <div class="row-head">
            <div class="row-title">
              <h3>{{ day.label }}</h3>
              <span class="badge" :class="{ ok: isDayComplete(day.key) }">
                {{ isDayComplete(day.key) ? '✅ erfüllt' : '⚠️ mind. 1 Rezept' }}
              </span>
            </div>

            <button class="mini" type="button" @click="clearDay(day.key)">Zurücksetzen</button>
          </div>

          <div class="slots">
            <div class="slot">
              <label>Frühstück</label>
              <select
                :value="gridModel[day.key]?.BREAKFAST ?? ''"
                @change="setSlot(day.key, 'BREAKFAST', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">—</option>
                <option v-for="r in recipeOptions" :key="r.id" :value="r.id">
                  {{ r.title }}
                </option>
              </select>
            </div>

            <div class="slot">
              <label>Mittagessen</label>
              <select
                :value="gridModel[day.key]?.LUNCH ?? ''"
                @change="setSlot(day.key, 'LUNCH', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">—</option>
                <option v-for="r in recipeOptions" :key="r.id" :value="r.id">
                  {{ r.title }}
                </option>
              </select>
            </div>

            <div class="slot">
              <label>Abendessen</label>
              <select
                :value="gridModel[day.key]?.DINNER ?? ''"
                @change="setSlot(day.key, 'DINNER', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">—</option>
                <option v-for="r in recipeOptions" :key="r.id" :value="r.id">
                  {{ r.title }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div class="note">
        <strong>Regel:</strong> Pro Tag mindestens 1 Rezept. Dann wird der PDF-Export freigeschaltet.
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding-bottom: 24px;
}

.head {
  display: flex;
  gap: 18px;
  align-items: flex-end;
  justify-content: space-between;
  margin: 10px 0 14px;
  flex-wrap: wrap;
}

.titlebox {
  min-width: 260px;
  max-width: 680px;
}

.kicker {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: var(--muted);
  margin-bottom: 6px;
}

h1 {
  margin: 0 0 6px;
  font-size: 28px;
}

.sub {
  margin: 0;
  color: var(--muted);
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.75);
  font-weight: 900;
  cursor: pointer;
}

.btn:hover:enabled {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(63, 109, 87, 0.14);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn2 {
  background: var(--btn2-bg);
  border-color: var(--btn2-border);
}

.card {
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 14px;
}

h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.formrow {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 14px;
}

@media (max-width: 820px) {
  .formrow {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
  color: var(--muted);
}

input,
select {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.75);
  font-size: 14px;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(63, 109, 87, 0.14);
}

.hint {
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
}

.muted {
  color: var(--muted);
  font-size: 14px;
}

.note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px dashed rgba(0, 0, 0, 0.18);
  color: var(--muted);
  background: rgba(255, 255, 255, 0.55);
}

/* ✅ Jede Woche: jeder Tag eigene Zeile, breite Box */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.day-row {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.14);
  padding: 14px;
}

.row-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.row-title {
  display: flex;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
}

h3 {
  margin: 0;
  font-size: 18px;
}

.badge {
  font-size: 12px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.55);
  color: var(--muted);
}

.badge.ok {
  border-color: rgba(63, 109, 87, 0.28);
  background: rgba(63, 109, 87, 0.1);
  color: var(--text);
}

.mini {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.65);
  font-weight: 900;
  cursor: pointer;
  font-size: 12px;
}

.mini:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(63, 109, 87, 0.12);
}

.slots {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 12px;
}

@media (max-width: 980px) {
  .slots {
    grid-template-columns: 1fr;
  }
}

.slot {
  display: flex;
  flex-direction: column;
}
</style>
