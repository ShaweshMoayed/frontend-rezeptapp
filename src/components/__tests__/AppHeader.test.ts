import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppHeader from '../AppHeader.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<any>('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
  }
})

// einfacher RouterLink-Stub
const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: `<a class="router-link" :data-to="JSON.stringify(to)"><slot /></a>`,
}

describe('AppHeader.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('zeigt Login-Link wenn nicht eingeloggt', () => {
    const auth = useAuthStore()
    auth.setToken('') // nicht eingeloggt

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Einloggen')
    expect(wrapper.text()).not.toContain('Ausloggen')
  })

  it('zeigt Username + Ausloggen wenn eingeloggt', () => {
    const auth = useAuthStore()
    auth.setToken('token')
    auth.user = { id: 1, username: 'moayed' }

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Hallo, moayed')
    expect(wrapper.text()).toContain('Ausloggen')
  })

  it('klick auf Ausloggen ruft auth.logout() auf und zeigt Toast', async () => {
    const auth = useAuthStore()
    const toast = useToastStore()

    auth.setToken('token')
    auth.user = { id: 1, username: 'moayed' }

    const logoutSpy = vi.spyOn(auth, 'logout').mockResolvedValue(undefined)
    const toastSpy = vi.spyOn(toast, 'info')

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    const btn = wrapper.get('button.logout-btn')
    await btn.trigger('click')

    expect(logoutSpy).toHaveBeenCalledOnce()
    expect(toastSpy).toHaveBeenCalledWith('Erfolgreich ausgeloggt.')
  })
})
