<template>
  <div class="app">
    <AppHeader />
    <router-view />
    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<style>
.app {
  min-height: 100vh;
  background: #faf7f1;
}
</style>
