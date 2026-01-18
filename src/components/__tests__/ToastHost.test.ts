import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToastHost from '../ToastHost.vue'
import { useToastStore } from '@/stores/toast.store'

describe('ToastHost.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('rendert keine Toasts wenn Store leer ist', () => {
    const wrapper = mount(ToastHost)
    expect(wrapper.findAll('.toast')).toHaveLength(0)
  })

  it('zeigt Toast aus Store an', async () => {
    const toast = useToastStore()
    toast.success('Hallo Welt', 0)

    const wrapper = mount(ToastHost)

    expect(wrapper.findAll('.toast')).toHaveLength(1)
    expect(wrapper.text()).toContain('Hallo Welt')
    expect(wrapper.find('.toast').classes()).toContain('success')
  })

  it('klick auf Toast entfernt ihn', async () => {
    const toast = useToastStore()
    toast.info('Click me', 0)

    const wrapper = mount(ToastHost)

    expect(wrapper.findAll('.toast')).toHaveLength(1)

    await wrapper.get('.toast').trigger('click')

    // DOM aktualisieren lassen
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.toast')).toHaveLength(0)
  })
})
