<template>
  <section class="hero">
    <div class="hero-card">
      <h1>Einloggen</h1>

      <form class="form" @submit.prevent="onLogin">
        <label class="label">
          Benutzername
          <input class="input" v-model="username" autocomplete="username" />
        </label>

        <label class="label">
          Passwort
          <input
            class="input"
            type="password"
            v-model="password"
            autocomplete="current-password"
          />
        </label>

        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <button class="btn primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? '…' : 'Einloggen' }}
        </button>

        <p class="hint">
          Noch keinen Account?
          <RouterLink to="/register">Registrieren</RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')

async function onLogin() {
  await auth.login(username.value.trim(), password.value)

  const redirect = (route.query.redirect as string) || '/rezepte'
  router.push(redirect)
}
</script>

<style scoped>
/* ✅ gleiches Hero-Layout wie Home, nur etwas weiter nach unten */
.hero {
  display: flex;
  justify-content: center;
  margin-top: 140px; /* <-- weiter nach unten */
  padding: 0 18px;
}

.hero-card {
  background: #f6f2ea; /* ✅ gleiche Farbe wie Home */
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 28px;
  padding: 34px 34px;
  max-width: 720px;
  width: 100%;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 18px;
  font-size: 1.9rem;
  font-weight: 900;
  color: #1f2a24;
}

.form {
  display: grid;
  gap: 12px;
}

.label {
  display: grid;
  gap: 6px;
  font-weight: 800;
  color: rgba(31, 42, 36, 0.9);
}

.input {
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(40, 40, 40, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 0 14px;
  outline: none;
}

.btn {
  height: 46px;
  border-radius: 999px;
  font-weight: 900;
  border: 1px solid rgba(47, 93, 76, 0.25);
  cursor: pointer;
}

.primary {
  background: #4f6f5f;
  color: #fff;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.error {
  color: rgba(140, 40, 40, 0.95);
  font-weight: 800;
}

.hint {
  margin: 6px 0 0;
  color: rgba(31, 42, 36, 0.75);
}

.hint a {
  color: #2f5d4c;
  font-weight: 900;
}
</style>
