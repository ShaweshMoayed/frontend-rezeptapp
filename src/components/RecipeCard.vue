<script setup lang="ts">
import type { Recipe } from "@/types/recipe";

defineProps<{
  recipe: Recipe;
}>();
</script>

<template>
  <article class="card">
    <img
      v-if="recipe.imageUrl"
      :src="recipe.imageUrl"
      alt="Rezeptbild"
      class="card-image"
    />

    <div class="card-body">
      <h3>{{ recipe.title }}</h3>
      <p>{{ recipe.description }}</p>

      <div class="meta">
        <span v-if="recipe.prepMinutes">⏱ {{ recipe.prepMinutes }} min</span>
        <span v-if="recipe.category">{{ recipe.category }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #020617;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.card-body {
  padding: 1rem;
}

.card-body h3 {
  margin: 0 0 0.5rem;
}

.card-body p {
  font-size: 0.9rem;
  opacity: 0.85;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
