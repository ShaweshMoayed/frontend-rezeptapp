<template>
  <section class="hero">
    <div class="hero-card">
      <h1>Registrieren</h1>

      <form class="form" @submit.prevent="onRegister">
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
            autocomplete="new-password"
          />
        </label>

        <label class="label">
          Passwort wiederholen
          <input
            class="input"
            type="password"
            v-model="password2"
            autocomplete="new-password"
          />
        </label>

        <button class="btn primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? '…' : 'Registrieren' }}
        </button>

        <p class="hint">
          Schon einen Account?
          <RouterLink to="/login">Einloggen</RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const username = ref('')
const password = ref('')
const password2 = ref('')

async function onRegister() {
  const u = username.value.trim()
  const p = password.value

  if (!u) {
    toast.error('Bitte einen Benutzernamen eingeben.')
    return
  }

  if (p !== password2.value) {
    toast.error('Passwörter stimmen nicht überein.')
    return
  }

  try {
    await auth.register(u, p)
    await auth.login(u, p)

    toast.success('Registrierung erfolgreich. Du bist jetzt eingeloggt.')

    const redirect = (route.query.redirect as string) || '/rezepte'
    router.push(redirect)
  } catch (e: any) {
    toast.error(e?.message || auth.error || 'Registrierung fehlgeschlagen.')
  }
}
</script>

<style scoped>
.hero {
  display: flex;
  justify-content: center;
  margin-top: 140px;
  padding: 0 18px;
}

.hero-card {
  background: #f6f2ea;
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

.hint {
  margin: 6px 0 0;
  color: rgba(31, 42, 36, 0.75);
}

.hint a {
  color: #2f5d4c;
  font-weight: 900;
}
</style>
