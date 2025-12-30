export type Nutrition = {
  caloriesKcal?: number | null
  proteinG?: number | null
  fatG?: number | null
  carbsG?: number | null
}

export type Ingredient = {
  id?: number
  name: string
  amount?: string | null
  unit?: string | null
}

export type Recipe = {
  id?: number
  title: string
  description: string
  instructions?: string | null
  category?: string | null
  imageUrl?: string | null
  imageBase64?: string | null
  prepMinutes?: number | null
  servings?: number | null
  nutrition?: Nutrition | null
  ingredients?: Ingredient[]
  createdAt?: string
  updatedAt?: string
}
