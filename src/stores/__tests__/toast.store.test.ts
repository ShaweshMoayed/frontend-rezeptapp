import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../toast.store'

describe('toast.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('push() fügt Toast hinzu', () => {
    const toast = useToastStore()

    expect(toast.toasts).toHaveLength(0)

    toast.push('info', 'Hallo')

    expect(toast.toasts).toHaveLength(1)
    expect(toast.toasts[0]!.message).toBe('Hallo')
    expect(toast.toasts[0]!.type).toBe('info')
  })

  it('success() erstellt Success-Toast', () => {
    const toast = useToastStore()

    toast.success('Erfolg')

    expect(toast.toasts[0]!.type).toBe('success')
    expect(toast.toasts[0]!.message).toBe('Erfolg')
  })

  it('Toast wird nach timeout automatisch entfernt', () => {
    const toast = useToastStore()

    toast.info('Auto Close', 1000)
    expect(toast.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1000)

    expect(toast.toasts).toHaveLength(0)
  })
})
