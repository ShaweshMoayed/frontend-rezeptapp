import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RecipeCard from '../RecipeCard.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRecipesStore } from '@/stores/recipes.store'

// RouterLink Stub, der "custom" + Slot-Props (navigate) unterstützt
const RouterLinkCustomStub = {
  name: 'RouterLink',
  props: ['to', 'custom'],
  emits: [],
  template: `
    <div class="routerlink-stub">
      <slot :navigate="navigate"></slot>
    </div>
  `,
  methods: {
    navigate() {
      // noop
    },
  },
}

describe('RecipeCard.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('rendert Titel & Beschreibung', () => {
    const auth = useAuthStore()
    auth.setToken('') // nicht eingeloggt

    const wrapper = mount(RecipeCard, {
      props: {
        recipe: {
          id: 10,
          title: 'Pizza',
          description: 'Lecker',
          imageBase64: 'data:image/jpeg;base64,AAA',
        },
      },
      global: {
        stubs: {
          RouterLink: RouterLinkCustomStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Pizza')
    expect(wrapper.text()).toContain('Lecker')
  })

  it('zeigt Herz-Button (Favorit) und ruft toggleFavorite auf', async () => {
    const auth = useAuthStore()
    auth.setToken('token')
    auth.user = { id: 1, username: 'u' }

    const recipes = useRecipesStore()
    recipes.favoriteIds = [] // nicht favorisiert

    const toggleSpy = vi.spyOn(recipes, 'toggleFavorite').mockResolvedValue(undefined)

    const wrapper = mount(RecipeCard, {
      props: {
        recipe: {
          id: 7,
          title: 'Pasta',
          description: 'Yum',
          imageBase64: 'data:image/jpeg;base64,AAA',
        },
      },
      global: {
        stubs: {
          RouterLink: RouterLinkCustomStub,
        },
      },
    })

    const btn = wrapper.get('button.fav')
    await btn.trigger('click')

    expect(toggleSpy).toHaveBeenCalledWith(7)
  })

  it('wenn recipe.imageBase64 gesetzt ist, wird data-url als img src genutzt', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: {
          id: 1,
          title: 'Test',
          description: '',
          imageBase64: 'data:image/png;base64,ABCDEF',
        },
      },
      global: {
        stubs: {
          RouterLink: RouterLinkCustomStub,
        },
      },
    })

    const img = wrapper.get('img')
    expect(img.attributes('src')).toContain('data:image/png;base64,ABCDEF')
  })
})
