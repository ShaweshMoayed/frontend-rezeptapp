<template>
  <div class="toast-wrap" aria-live="polite" aria-relevant="additions removals">
    <transition-group name="toast" tag="div" class="toast-stack">
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
        role="status"
        @click="toast.remove(t.id)"
        title="Klicken zum Schließen"
      >
        <span class="dot" aria-hidden="true"></span>
        <span class="msg">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
const toast = useToastStore()
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast-stack {
  display: grid;
  gap: 10px;
}

.toast {
  pointer-events: auto;
  min-width: 280px;
  max-width: 560px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 18px 45px rgba(0,0,0,0.12);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(47, 93, 76, 1);
}

.toast.success .dot { background: #2f5d4c; }
.toast.info .dot { background: #3a6ea5; }
.toast.error .dot { background: #a33a3a; }

.msg {
  font-weight: 800;
  color: rgba(20, 24, 22, 0.92);
  line-height: 1.3;
}

/* Animations */
.toast-enter-active, .toast-leave-active { transition: all 180ms ease; }
.toast-enter-from { opacity: 0; transform: translateY(-8px); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
