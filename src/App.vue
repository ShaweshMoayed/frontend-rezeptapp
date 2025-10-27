<template>
  <main class="app-container">
    <RecipeList />
  </main>
</template>

<script setup lang="ts">
import RecipeList from './components/RecipeList.vue'
</script>

<style>
/* Grundlegendes Reset und Hintergrund-Design */
html, body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100%;
}

/* App-Container sorgt für zentrierte Darstellung */
.app-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 40px;
}

/* Standardlinks entfernen (für sauberes Layout) */
a {
  color: inherit;
  text-decoration: none;
}
</style>
