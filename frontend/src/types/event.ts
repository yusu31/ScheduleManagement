export type Event = {
  id: number
  title: string
  description: string | null
  location: string | null
  area: string
  category: string
  start_at: string
  end_at: string | null
  capacity: number | null
  event_url: string | null
  image_url: string | null
  source: string
  connpass_id: number | null
  tags: string[]
  created_at: string
  updated_at: string
}
