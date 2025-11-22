<template>
  <div class="app-shell">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* Grundlegendes Reset und Hintergrund-Design */
html,
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100%;
}

/* App-Shell um die Seiten herum */
.app-shell {
  min-height: 100vh;
}

/* Standardlinks entfernen (für sauberes Layout) */
a {
  color: inherit;
  text-decoration: none;
}
</style>
