<script setup lang="ts">
import RecipeList from '@/components/RecipeList.vue'
</script>

<template>
  <main class="page">
    <section class="hero">
      <h1>🍽️ RezeptApp</h1>
      <p class="tagline">Eine kleine App zur Anzeige von Rezepten aus dem Spring-Boot-Backend.</p>
    </section>

    <section class="list-section">
      <h2 class="list-heading">Rezeptübersicht</h2>
      <p class="list-subtitle">Die Daten werden per GET-Request vom Backend geladen.</p>

      <RecipeList />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 16px 60px;
}

.hero {
  text-align: center;
  margin-bottom: 32px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 2.2rem;
}

.tagline {
  margin: 0;
  color: #6c757d;
}

.list-section {
  margin-top: 16px;
}

.list-heading {
  text-align: center;
  margin-bottom: 4px;
  color: #2c3e50;
}

.list-subtitle {
  text-align: center;
  color: #6c757d;
  margin-bottom: 20px;
  font-size: 0.95rem;
}
</style>
