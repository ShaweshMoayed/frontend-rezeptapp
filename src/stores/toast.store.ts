import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export type ToastActionStyle = 'primary' | 'danger' | 'neutral'

export type ToastAction = {
  label: string
  style?: ToastActionStyle
  onClick: () => void
}

export type ToastItem = {
  id: string
  type: ToastType
  message: string
  timeoutMs: number
  actions?: ToastAction[]
  onClose?: () => void
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export type ConfirmOptions = {
  type?: ToastType
  confirmText?: string
  cancelText?: string
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as ToastItem[],
  }),

  actions: {
    push(type: ToastType, message: string, timeoutMs = 2600, extra?: Partial<ToastItem>) {
      const item: ToastItem = {
        id: uid(),
        type,
        message,
        timeoutMs,
        ...(extra || {}),
      }

      this.toasts.push(item)

      // timeoutMs <= 0 => sticky (kein Auto-Close)
      if (timeoutMs > 0) {
        window.setTimeout(() => {
          this.remove(item.id)
        }, timeoutMs)
      }

      return item.id
    },

    success(message: string, timeoutMs?: number) {
      this.push('success', message, timeoutMs ?? 2600)
    },

    error(message: string, timeoutMs?: number) {
      this.push('error', message, timeoutMs ?? 2600)
    },

    info(message: string, timeoutMs?: number) {
      this.push('info', message, timeoutMs ?? 2600)
    },

    /**
     * ✅ Toast-basierte Bestätigung (statt window.confirm)
     * Usage:
     *   const ok = await toast.confirm("Wirklich löschen?", { type: 'error' })
     */
    confirm(message: string, options: ConfirmOptions = {}) {
      const type: ToastType = options.type ?? 'info'
      const confirmText = options.confirmText ?? 'OK'
      const cancelText = options.cancelText ?? 'Abbrechen'

      return new Promise<boolean>((resolve) => {
        let toastId = ''

        const finish = (result: boolean) => {
          // Wichtig: erst resolve, dann remove (damit UI nicht “hakt”)
          resolve(result)
          if (toastId) this.remove(toastId)
        }

        toastId = this.push(
          type,
          message,
          0, // sticky
          {
            actions: [
              {
                label: cancelText,
                style: 'neutral',
                onClick: () => finish(false),
              },
              {
                label: confirmText,
                style: type === 'error' ? 'danger' : 'primary',
                onClick: () => finish(true),
              },
            ],
            onClose: () => resolve(false), // wenn User Toast wegklickt => cancel
          }
        )
      })
    },

    remove(id: string) {
      const item = this.toasts.find((t) => t.id === id)
      if (item?.onClose) {
        try {
          item.onClose()
        } catch {
          // ignore
        }
      }
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    clear() {
      // beim Clear auch onClose triggern
      for (const t of this.toasts) {
        if (t.onClose) {
          try {
            t.onClose()
          } catch {
            // ignore
          }
        }
      }
      this.toasts = []
    },
  },
})
