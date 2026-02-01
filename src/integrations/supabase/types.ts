export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          section: string
          title: string
          content: string
          image_url: string | null
          links: Json | null
          subjects: string[] | null
          created_at: string
          is_active: boolean | null
        }
        Insert: {
          id?: string
          section: string
          title: string
          content: string
          image_url?: string | null
          links?: Json | null
          subjects?: string[] | null
          created_at?: string
          is_active?: boolean | null
        }
        Update: {
          id?: string
          section?: string
          title?: string
          content?: string
          image_url?: string | null
          links?: Json | null
          subjects?: string[] | null
          created_at?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      day_comments: {
        Row: {
          id: string
          day: string
          text: string
          created_at: string
          user_name: string | null
        }
        Insert: {
          id?: string
          day: string
          text: string
          created_at?: string
          user_name?: string | null
        }
        Update: {
          id?: string
          day?: string
          text?: string
          created_at?: string
          user_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      translations_history: {
        Row: {
          id: string
          original_text: string
          translated_text: string
          source_lang: string
          target_lang: string
          created_at: string
        }
        Insert: {
          id?: string
          original_text: string
          translated_text: string
          source_lang: string
          target_lang: string
          created_at?: string
        }
        Update: {
          id?: string
          original_text?: string
          translated_text?: string
          source_lang?: string
          target_lang?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}