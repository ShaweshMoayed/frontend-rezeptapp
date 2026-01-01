<template>
  <header class="topbar">
    <div class="logo-float">
      <img src="@/assets/logo.svg" alt="Rezept App Logo" />
    </div>

    <nav class="nav-bar">
      <div class="nav-left">
        <RouterLink to="/" end>Start</RouterLink>
        <RouterLink to="/rezepte">Rezepte</RouterLink>
        <RouterLink to="/rezepte/neu">Rezept erstellen</RouterLink>
        <RouterLink to="/stats">Statistiken</RouterLink>
        <RouterLink to="/plan">Essensplan</RouterLink>

        <RouterLink v-if="auth.isLoggedIn" to="/favorites">Favoriten</RouterLink>
      </div>

      <div class="nav-right">
        <div v-if="auth.isLoggedIn" class="user-area">
          <span class="hello" v-if="auth.user?.username">Hallo, {{ auth.user.username }}</span>

          <button class="logout-btn" @click="onLogout" :disabled="auth.loading">
            {{ auth.loading ? '…' : 'Ausloggen' }}
          </button>
        </div>

        <RouterLink v-else to="/login" class="login-btn">Einloggen</RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

async function onLogout() {
  await auth.logout()
  router.push('/') // ✅ Redirect nach Logout
}
</script>

<style scoped>
.topbar { position: relative; padding-top: 5.5rem; }

.logo-float {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: float 6s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}

.logo-float img { width: 92px; }

@keyframes float {
  0% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -8px); }
  100% { transform: translate(-50%, 0); }
}

.nav-bar {
  max-width: 1100px;
  margin: 0 auto;
  background: #e4dfd4;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-left a {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  color: #2e2e2e;
  text-decoration: none;
  transition: all 0.25s ease;
}

.nav-left a:hover { background: rgba(70, 120, 95, 0.15); }

.nav-left a.router-link-active,
.nav-left a.router-link-exact-active {
  background: #cfe0d6;
  color: #2f5d4c;
}

.login-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  background: #d7e3dc;
  color: #2f5d4c;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
}

.login-btn:hover { background: #c2d5cb; }

.user-area { display: inline-flex; align-items: center; gap: 10px; }

.hello {
  font-weight: 700;
  color: #2f5d4c;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(47, 93, 76, 0.10);
  border: 1px solid rgba(47, 93, 76, 0.15);
}

.logout-btn {
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  background: #2f5d4c;
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.logout-btn:hover { transform: translateY(-1px); filter: brightness(1.03); }
.logout-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
</style>
