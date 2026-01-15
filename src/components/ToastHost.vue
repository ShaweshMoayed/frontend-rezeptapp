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

        <div class="body">
          <span class="msg">{{ t.message }}</span>

          <div v-if="t.actions?.length" class="actions" @click.stop>
            <button
              v-for="(a, idx) in t.actions"
              :key="idx"
              class="action-btn"
              :class="a.style || 'neutral'"
              type="button"
              @click="a.onClick()"
            >
              {{ a.label }}
            </button>
          </div>
        </div>
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
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(47, 93, 76, 1);
  margin-top: 6px;
  flex: 0 0 auto;
}

.toast.success .dot { background: #2f5d4c; }
.toast.info .dot { background: #3a6ea5; }
.toast.error .dot { background: #a33a3a; }

.body {
  display: grid;
  gap: 10px;
  width: 100%;
}

.msg {
  font-weight: 800;
  color: rgba(20, 24, 22, 0.92);
  line-height: 1.3;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.70);
  font-weight: 900;
  cursor: pointer;
}

.action-btn.neutral {
  color: rgba(31, 42, 36, 0.9);
}

.action-btn.primary {
  border-color: rgba(47, 93, 76, 0.28);
  background: rgba(47, 93, 76, 0.12);
  color: #2f5d4c;
}

.action-btn.danger {
  border-color: rgba(160, 60, 60, 0.35);
  background: rgba(160, 60, 60, 0.12);
  color: rgba(120, 30, 30, 0.95);
}

/* Animations */
.toast-enter-active, .toast-leave-active { transition: all 180ms ease; }
.toast-enter-from { opacity: 0; transform: translateY(-8px); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
