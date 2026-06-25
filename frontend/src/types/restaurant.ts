export type Restaurant = {
  id: number
  name: string
  description: string | null
  area: string
  municipality: string | null
  address: string | null
  category: string
  genre: string | null
  latitude: string | null
  longitude: string | null
  image_url: string | null
  official_url: string | null
  phone: string | null
  opening_hours: string | null
  budget: string | null
  situation_tags: string[] | null
  hotpepper_id: string | null
  source: string
  status: string
  created_at: string
  updated_at: string
}
