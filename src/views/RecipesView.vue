<template>
  <section class="page">
    <header class="header">
      <div>
        <h1>Rezepte</h1>
        <p class="sub">Durchsuche deine Rezepte und filtere nach Kategorie.</p>
      </div>

      <div class="filters">
        <input
          class="input"
          v-model="store.search"
          placeholder="Suchen..."
          @keyup.enter="store.loadRecipes()"
        />

        <select class="select" v-model="store.category" @change="store.loadRecipes()">
          <option value="">Alle Kategorien</option>
          <option v-for="c in store.categories" :key="c" :value="c">{{ c }}</option>
        </select>

        <button class="btn" @click="store.loadRecipes()">Laden</button>
      </div>
    </header>

    <div v-if="store.loading" class="state">Lade Rezepte…</div>
    <div v-else-if="store.error" class="state error">⚠️ {{ store.error }}</div>

    <div v-else class="grid">
      <RecipeCard v-for="r in store.items" :key="r.id" :recipe="r" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecipesStore } from '../stores/recipes.store'
import RecipeCard from '../components/RecipeCard.vue'

const store = useRecipesStore()

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.page {
  display: grid;
  gap: 18px;
}
.header {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
}
h1 {
  margin: 0;
  font-size: 30px;
}
.sub {
  margin: 6px 0 0;
  color: var(--muted);
}
.filters {
  display: grid;
  grid-template-columns: 1fr 220px 120px;
  gap: 10px;
  align-items: center;
}
.state {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  color: var(--muted);
}
.state.error {
  color: #b42318;
  border-color: #f2b8b5;
  background: #fff5f5;
}
.grid {
  display: grid;
  gap: 12px;
}
@media (max-width: 820px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
