export type FortuneCategory =
  | 'advice'
  | 'warning'
  | 'reminder'
  | 'synchronicity'
  | 'relationship'
  | 'decision'
  | 'shadow'
  | 'abundance'

export type FortuneSource = 'seed' | 'ai_generated' | 'user_submitted'

export type QueryType = 'daily' | 'life' | 'month' | 'situation'

export interface Fortune {
  id: string
  title: string
  body: string
  category: FortuneCategory
  tags: string[]
  highlight_word: string
  is_active: boolean
  source: FortuneSource
  created_at: string
}

export interface UserFortune {
  id: string
  user_id: string
  fortune_id: string
  received_at: string
  query_type: QueryType
  journal_entry: string | null
  saved: boolean
  fortune?: Fortune
}

export interface UserDailyUsage {
  id: string
  user_id: string
  usage_date: string
  extra_queries_used: number
  daily_fortune_id: string | null
}

export type Database = {
  public: {
    Tables: {
      fortunes: {
        Row: Fortune
        Insert: Omit<Fortune, 'id' | 'created_at'>
        Update: Partial<Omit<Fortune, 'id' | 'created_at'>>
      }
      user_fortunes: {
        Row: UserFortune
        Insert: Omit<UserFortune, 'id' | 'received_at'>
        Update: Partial<Omit<UserFortune, 'id' | 'received_at'>>
      }
      user_daily_usage: {
        Row: UserDailyUsage
        Insert: Omit<UserDailyUsage, 'id'>
        Update: Partial<Omit<UserDailyUsage, 'id'>>
      }
    }
  }
}
