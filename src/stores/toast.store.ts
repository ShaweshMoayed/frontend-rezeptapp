import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  type: ToastType
  message: string
  timeoutMs: number
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as ToastItem[],
  }),

  actions: {
    push(type: ToastType, message: string, timeoutMs = 2600) {
      const item: ToastItem = { id: uid(), type, message, timeoutMs }
      this.toasts.push(item)

      window.setTimeout(() => {
        this.remove(item.id)
      }, timeoutMs)
    },

    success(message: string, timeoutMs?: number) {
      this.push('success', message, timeoutMs)
    },

    error(message: string, timeoutMs?: number) {
      this.push('error', message, timeoutMs)
    },

    info(message: string, timeoutMs?: number) {
      this.push('info', message, timeoutMs)
    },

    remove(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    clear() {
      this.toasts = []
    },
  },
})
