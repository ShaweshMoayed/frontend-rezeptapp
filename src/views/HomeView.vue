<template>
  <section class="hero">
    <div class="hero-card">
      <h1>Willkommen bei der <span>Rezept App</span></h1>

      <p>
        Dein digitales Kochbuch: Rezepte speichern, Favoriten sammeln, Nährwerte
        vergleichen und deine Woche mit einem Essensplan organisieren.
      </p>

      <!-- ✅ Nur anzeigen, wenn NICHT eingeloggt -->
      <div v-if="!auth.isLoggedIn" class="actions">
        <RouterLink to="/register" class="btn primary">Registrieren</RouterLink>
        <RouterLink to="/login" class="btn secondary">Einloggen</RouterLink>
      </div>

      <!-- Optional: Wenn eingeloggt, kannst du hier stattdessen was anzeigen -->
      <div v-else class="logged-hint">
        <RouterLink to="/rezepte" class="btn primary">Zu den Rezepten</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
const auth = useAuthStore()
</script>

<style scoped>
.hero {
  display: flex;
  justify-content: center;
  margin-top: 120px;
}

.hero-card {
  background: #f6f2ea;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 28px;
  padding: 56px 72px;
  max-width: 760px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 16px;
}

h1 span {
  color: #4f6f5f;
}

p {
  font-size: 16px;
  line-height: 1.6;
  color: #4b4b4b;
  margin-bottom: 32px;
}

.actions,
.logged-hint {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* Buttons */
.btn {
  padding: 12px 28px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
}

.primary {
  background: #4f6f5f;
  color: white;
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
}

.secondary {
  border: 2px solid #4f6f5f;
  color: #2f4036;
  background: transparent;
}

.secondary:hover {
  background: #e2ebe6;
}
</style>
