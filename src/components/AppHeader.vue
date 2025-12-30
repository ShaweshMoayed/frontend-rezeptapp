<template>
  <header class="header">
    <div class="container header-inner">
      <div class="brand">
        <span class="logo">🍲</span>
        <span class="name">RezeptApp</span>
      </div>
      <nav class="nav">
        <RouterLink to="/">Rezepte</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.header { border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(10px); }
.header-inner { display:flex; align-items:center; justify-content:space-between; padding: 14px 0; }
.brand { display:flex; gap:10px; align-items:center; font-weight:700; }
.logo { font-size: 20px; }
.nav { display:flex; gap:14px; }
.nav a { opacity: .8; }
.nav a.router-link-active { opacity: 1; text-decoration: underline; }
</style>
