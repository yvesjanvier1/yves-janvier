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
      about_page: {
        Row: {
          bio: string
          created_at: string
          id: string
          profile_image: string | null
          resume_url: string | null
          updated_at: string
        }
        Insert: {
          bio: string
          created_at?: string
          id?: string
          profile_image?: string | null
          resume_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          id?: string
          profile_image?: string | null
          resume_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string | null
        }
        Relationships: []
      }
      experience: {
        Row: {
          company: string
          created_at: string
          description: string
          id: string
          role: string
          updated_at: string
          year_range: string
        }
        Insert: {
          company: string
          created_at?: string
          description: string
          id?: string
          role: string
          updated_at?: string
          year_range: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          id?: string
          role?: string
          updated_at?: string
          year_range?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string
          date: string
          entry_type: string
          external_link: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          date?: string
          entry_type?: string
          external_link?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          date?: string
          entry_type?: string
          external_link?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          category: string | null
          created_at: string
          description: string
          featured: boolean | null
          id: string
          images: string[] | null
          links: Json | null
          slug: string
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          links?: Json | null
          slug: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          links?: Json | null
          slug?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          items: string[]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          items?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          items?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          position: string
          testimonial: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name: string
          position: string
          testimonial: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          position?: string
          testimonial?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          last_view: string | null
          page: string | null
          unique_visitors: number | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      track_page_view: {
        Args: {
          page_path: string
          visitor: string
          referrer: string
          agent: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
