<template>
  <article class="card">
    <div class="img" v-if="image">
      <img :src="image" :alt="recipe.title" />
    </div>

    <div class="content">
      <div class="top">
        <h3 class="title">{{ recipe.title }}</h3>
        <span v-if="recipe.category" class="badge">{{ recipe.category }}</span>
      </div>

      <p class="desc">{{ recipe.description }}</p>

      <div class="meta">
        <span v-if="recipe.prepMinutes != null">⏱ {{ recipe.prepMinutes }} min</span>
        <span v-if="recipe.servings != null">🍽 {{ recipe.servings }} Portionen</span>
        <span v-if="recipe.nutrition?.caloriesKcal != null">🔥 {{ recipe.nutrition.caloriesKcal }} kcal</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Recipe } from '../types/recipe'

const props = defineProps<{ recipe: Recipe }>()

const image = computed(() => {
  if (props.recipe.imageBase64 && props.recipe.imageBase64.trim().length > 0) {
    // kann "data:image/..." oder raw base64 sein
    return props.recipe.imageBase64.startsWith('data:')
      ? props.recipe.imageBase64
      : `data:image/png;base64,${props.recipe.imageBase64}`
  }
  return props.recipe.imageUrl || ''
})

import { computed } from 'vue'
</script>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 160px 1fr;
  min-height: 140px;
}

.img {
  background: #f2f2f2;
}
.img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.content {
  padding: 14px 14px 12px;
  display: grid;
  gap: 10px;
}

.top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.badge {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--chip);
  border: 1px solid var(--border);
  white-space: nowrap;
}

.desc {
  margin: 0;
  color: var(--muted);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
}
</style>
