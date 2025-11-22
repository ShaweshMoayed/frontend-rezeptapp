<template>
  <div class="outer-container">
    <div class="content">
      <!-- Ladezustand -->
      <p v-if="isLoading" class="info-text">
        ⏳ Rezepte werden geladen ...
      </p>

      <!-- Fehlermeldung -->
      <p v-else-if="errorMessage" class="error-text">
        {{ errorMessage }}
      </p>

      <!-- Tabelle mit Rezepten -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Rezept {
  id: number
  name: string
  beschreibung: string
}

// Zustände
const rezepte = ref<Rezept[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string>('')

// Basis-URL des Backends: aus ENV, sonst localhost
const backendBaseUrl =
  import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8080'

async function loadRezepte() {
  isLoading.value = true
  errorMessage.value = ''
  rezepte.value = []

  try {
    const response = await fetch(`${backendBaseUrl}/rezepte`)

    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Rezepte (Status ${response.status})`)
    }

    const data: Rezept[] = await response.json()
    rezepte.value = data
  } catch (error) {
    console.error('Fehler beim Laden der Rezepte:', error)
    errorMessage.value =
      'Die Rezepte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.'
  } finally {
    isLoading.value = false
  }
}

// Beim Mounten der Komponente Daten laden
onMounted(() => {
  void loadRezepte()
})
</script>

<style scoped>
/* Äußerer Container: zentriert den Inhalt */
.outer-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Innerer Bereich mit Inhalt */
.content {
  text-align: left;
  width: 100%;
}

/* Info-/Fehlertexte */
.info-text {
  text-align: center;
  color: #6c757d;
  margin-top: 16px;
}

.error-text {
  text-align: center;
  color: #b3261e;
  background-color: #ffe5e1;
  border-radius: 6px;
  padding: 10px 14px;
  margin: 16px auto;
  max-width: 600px;
}

/* Tabelle */
table {
  width: 100%;
  max-width: 700px;
  border-collapse: collapse;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #fafafa;
}

/* Kein Rezept gefunden Text */
.empty-text {
  color: #888;
  margin-top: 20px;
  text-align: center;
}
</style>
