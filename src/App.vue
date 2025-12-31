<template>
  <div class="app">
    <AppHeader />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<style>
.app {
  min-height: 100vh;
  background: #faf7f1;
}
</style>
