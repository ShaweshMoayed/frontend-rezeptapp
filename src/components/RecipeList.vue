<template>
  <section class="outer-container">
    <div class="content">
      <h2 class="title">Rezeptübersicht</h2>
      <p class="subtitle">
        Daten werden vom Spring-Boot-Backend geladen.
      </p>

      <!-- ✅ M4: Rezept hinzufügen (POST) -->
      <div class="card">
        <h3 class="card-title">Neues Rezept hinzufügen</h3>

        <form class="form" @submit.prevent="createRezept">
          <div class="field">
            <label class="label" for="name">Name</label>
            <input
              id="name"
              v-model.trim="newName"
              class="input"
              type="text"
              placeholder="z.B. Lasagne"
              required
              minlength="2"
            />
          </div>

          <div class="field">
            <label class="label" for="beschreibung">Beschreibung</label>
            <textarea
              id="beschreibung"
              v-model.trim="newBeschreibung"
              class="textarea"
              placeholder="Kurze Beschreibung..."
              required
              minlength="3"
              rows="3"
            />
          </div>

          <div class="actions">
            <button class="btn" type="submit" :disabled="isCreating">
              {{ isCreating ? 'Speichert...' : 'Rezept speichern (POST)' }}
            </button>

            <button
              class="btn secondary"
              type="button"
              @click="resetForm"
              :disabled="isCreating"
            >
              Zurücksetzen
            </button>
          </div>
        </form>

        <p v-if="createSuccess" class="success-text">
          ✅ Rezept wurde gespeichert.
        </p>
        <p v-else-if="createError" class="error-text">
          {{ createError }}
        </p>
      </div>

      <!-- Ladezustand -->
      <p v-if="isLoading" class="info-text">
        ⏳ Rezepte werden geladen ...
      </p>

      <!-- Fehlermeldung -->
      <p v-else-if="errorMessage" class="error-text">
        {{ errorMessage }}
      </p>

      <!-- Tabelle -->
      <table v-else-if="rezepte.length > 0">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Beschreibung</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="rezept in rezepte" :key="rezept.id">
          <td>{{ rezept.id }}</td>
          <td>{{ rezept.name }}</td>
          <td>{{ rezept.beschreibung }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Keine Rezepte -->
      <p v-else class="empty-text">
        Keine Rezepte gefunden.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/* ============================
   Typen
============================ */
interface Rezept {
  id: number
  name: string
  beschreibung: string
}

/* ============================
   State
============================ */
const rezepte = ref<Rezept[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isCreating = ref(false)
const createError = ref('')
const createSuccess = ref(false)

const newName = ref('')
const newBeschreibung = ref('')

/* ============================
   Backend-Konfiguration
============================ */
// Render oder lokal
const backendBaseUrl =
  import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080'

// ⚠️ WICHTIG: MUSS GENAU ZUM BACKEND PASSEN
// Dein Controller nutzt @RequestMapping("/rezeptapp")
const apiPath = '/rezeptapp'

/* ============================
   GET: Rezepte laden
============================ */
async function loadRezepte() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${backendBaseUrl}${apiPath}`)

    if (!response.ok) {
      throw new Error(`Fehler beim Laden (Status ${response.status})`)
    }

    rezepte.value = await response.json()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      'Die Rezepte konnten nicht geladen werden. Bitte später erneut versuchen.'
  } finally {
    isLoading.value = false
  }
}

/* ============================
   Formular-Helfer
============================ */
function resetForm() {
  newName.value = ''
  newBeschreibung.value = ''
  createError.value = ''
  createSuccess.value = false
}

/* ============================
   POST: Rezept erstellen
============================ */
async function createRezept() {
  createError.value = ''
  createSuccess.value = false

  if (newName.value.length < 2 || newBeschreibung.value.length < 3) {
    createError.value = 'Bitte Name und Beschreibung sinnvoll ausfüllen.'
    return
  }

  isCreating.value = true

  try {
    const payload = {
      name: newName.value,
      beschreibung: newBeschreibung.value
    }

    const response = await fetch(`${backendBaseUrl}${apiPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`POST fehlgeschlagen (${response.status}) ${text}`)
    }

    createSuccess.value = true
    resetForm()
    await loadRezepte() // ✅ M4: nach POST neu laden
  } catch (error) {
    console.error(error)
    createError.value =
      'Speichern fehlgeschlagen. Prüfe Backend-URL, Endpoint oder CORS.'
  } finally {
    isCreating.value = false
  }
}

/* ============================
   Lifecycle
============================ */
onMounted(() => {
  void loadRezepte()
})
</script>

<style scoped>
/* (dein CSS bleibt unverändert – bewusst nicht angefasst) */
</style>
