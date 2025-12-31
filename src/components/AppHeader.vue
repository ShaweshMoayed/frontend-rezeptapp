<template>
  <header class="topbar">
    <!-- Logo schwebt darüber -->
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
      </div>

      <div class="nav-right">
        <RouterLink to="/login" class="login-btn">
          Einloggen
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
/* ===== Header Grundlayout ===== */
.topbar {
  position: relative;
  padding-top: 5.5rem;
}

/* ===== Schwebendes Logo ===== */
.logo-float {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: float 6s ease-in-out infinite;
  z-index: 2;
}

.logo-float img {
  width: 92px;
}

/* Schwebeanimation */
@keyframes float {
  0% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -8px); }
  100% { transform: translate(-50%, 0); }
}

/* ===== Navbar ===== */
.nav-bar {
  max-width: 1100px;
  margin: 0 auto;
  background: #e4dfd4;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* ===== Link Gruppen ===== */
.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ===== Normale Nav Links ===== */
.nav-left a {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  color: #2e2e2e;
  text-decoration: none;
  transition: all 0.25s ease;
}

/* Hover */
.nav-left a:hover {
  background: rgba(70, 120, 95, 0.15);
}

/* ✅ AKTIVER LINK (wie „Start“) */
.nav-left a.router-link-exact-active {
  background: #cfe0d6;
  color: #2f5d4c;
}

/* ===== Login Button ===== */
.login-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  background: #d7e3dc;
  color: #2f5d4c;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
}

.login-btn:hover {
  background: #c2d5cb;
}
</style>
