<template>
  <div class="outer-container">
    <div class="content">
      <h2>🍽️ Rezeptübersicht</h2>
      <p class="subtitle">Eine einfache Liste mit Beispielrezepten</p>

      <table>
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

      <p v-if="rezepte.length === 0" class="empty-text">
        Keine Rezepte gefunden.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rezepte = ref([
  { id: 1, name: 'Spaghetti Carbonara', beschreibung: 'Klassisches italienisches Gericht mit Ei, Speck und Parmesan.' },
  { id: 2, name: 'Gemüsesuppe', beschreibung: 'Leichte Suppe mit frischem Gemüse — perfekt für kalte Tage.' },
  { id: 3, name: 'Pancakes', beschreibung: 'Fluffige Pfannkuchen mit Ahornsirup und Beeren.' }
])
</script>

<style scoped>
/* Äußerer Container: zentriert ALLES auf der Seite */
.outer-container {
  display: flex;
  justify-content: center; /* horizontal zentrieren */
  align-items: center; /* vertikal zentrieren */
  height: 100vh;
  background-color: #f8f9fa;
}

/* Innerer Bereich mit Inhalt */
.content {
  text-align: center;
}

/* Überschrift */
h2 {
  color: #2c3e50;
  margin-bottom: 5px;
}

/* Untertitel */
.subtitle {
  color: #6c757d;
  margin-bottom: 20px;
}

/* Tabelle */
table {
  width: 650px;
  border-collapse: collapse;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
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
}
</style>
