export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string | null
          consistency_score: number | null
          contact_frequency_days: number | null
          context_notes: string | null
          created_at: string | null
          depth_score: number | null
          email: string | null
          first_contact_date: string | null
          followup_priority_score: number | null
          frequency_score: number | null
          id: string
          last_contact_date: string | null
          linkedin_url: string | null
          name: string
          phone: string | null
          profile_photo_url: string | null
          recency_score: number | null
          relationship_health_score: number | null
          source: string | null
          tags: string[] | null
          title: string | null
          total_interactions: number | null
          updated_at: string | null
          user_id: string
          user_priority: number | null
          where_met: string | null
        }
        Insert: {
          company?: string | null
          consistency_score?: number | null
          contact_frequency_days?: number | null
          context_notes?: string | null
          created_at?: string | null
          depth_score?: number | null
          email?: string | null
          first_contact_date?: string | null
          followup_priority_score?: number | null
          frequency_score?: number | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name: string
          phone?: string | null
          profile_photo_url?: string | null
          recency_score?: number | null
          relationship_health_score?: number | null
          source?: string | null
          tags?: string[] | null
          title?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id: string
          user_priority?: number | null
          where_met?: string | null
        }
        Update: {
          company?: string | null
          consistency_score?: number | null
          contact_frequency_days?: number | null
          context_notes?: string | null
          created_at?: string | null
          depth_score?: number | null
          email?: string | null
          first_contact_date?: string | null
          followup_priority_score?: number | null
          frequency_score?: number | null
          id?: string
          last_contact_date?: string | null
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          profile_photo_url?: string | null
          recency_score?: number | null
          relationship_health_score?: number | null
          source?: string | null
          tags?: string[] | null
          title?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id?: string
          user_priority?: number | null
          where_met?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          category: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_snapshots: {
        Row: {
          contact_id: string
          created_at: string | null
          health_score: number
          id: string
          snapshot_date: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          health_score: number
          id?: string
          snapshot_date?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          health_score?: number
          id?: string
          snapshot_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_snapshots_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          contact_id: string
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          quality_rating: number | null
          type: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          type: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          quality_rating?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_processing_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          platforms: string[]
          progress: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          platforms: string[]
          progress?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          platforms?: string[]
          progress?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_user_id: string
          referrer: string | null
          updated_at: string
          user_agent: string | null
          viewer_ip: string | null
          viewer_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_user_id: string
          referrer?: string | null
          updated_at?: string
          user_agent?: string | null
          viewer_ip?: string | null
          viewer_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_user_id?: string
          referrer?: string | null
          updated_at?: string
          user_agent?: string | null
          viewer_ip?: string | null
          viewer_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_processed: boolean | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          display_name: string | null
          experience: Json | null
          featured_work: Json | null
          first_name: string | null
          id: string
          instagram_handle: string | null
          interests: string[] | null
          is_public: boolean
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone_number: string | null
          profile_completeness: number | null
          resume_filename: string | null
          resume_url: string | null
          skills: string[] | null
          social_links: Json | null
          updated_at: string
          user_id: string
          website_url: string | null
          work_experience: Json | null
        }
        Insert: {
          ai_processed?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          experience?: Json | null
          featured_work?: Json | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          interests?: string[] | null
          is_public?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          profile_completeness?: number | null
          resume_filename?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          work_experience?: Json | null
        }
        Update: {
          ai_processed?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          experience?: Json | null
          featured_work?: Json | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          interests?: string[] | null
          is_public?: boolean
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          profile_completeness?: number | null
          resume_filename?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          work_experience?: Json | null
        }
        Relationships: []
      }
      social_media_data: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          platform: string
          processed_data: Json | null
          raw_data: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform: string
          processed_data?: Json | null
          raw_data: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform?: string
          processed_data?: Json | null
          raw_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone_number: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_chat_and_connect: {
        Args: { p_current_user: string; p_target_user: string }
        Returns: string
      }
      get_profile_contact_info: {
        Args: { target_user_id: string }
        Returns: {
          contact_social_links: Json
          email: string
          phone_number: string
        }[]
      }
      get_public_profile_data: {
        Args: { target_user_id: string }
        Returns: {
          ai_processed: boolean
          avatar_url: string
          bio: string
          company: string
          created_at: string
          display_name: string
          experience: Json
          id: string
          interests: string[]
          job_title: string
          location: string
          profile_completeness: number
          skills: string[]
          social_links: Json
          updated_at: string
          user_id: string
          website_url: string
          work_experience: Json
        }[]
      }
      get_public_profile_secure: {
        Args: { target_user_id: string }
        Returns: {
          ai_processed: boolean
          avatar_url: string
          bio: string
          company: string
          created_at: string
          display_name: string
          id: string
          interests: string[]
          job_title: string
          location: string
          phone_number: string
          profile_completeness: number
          skills: string[]
          social_links: Json
          updated_at: string
          user_id: string
          website_url: string
        }[]
      }
      get_public_profiles_list: {
        Args: { user_ids: string[] }
        Returns: {
          ai_processed: boolean
          avatar_url: string
          bio: string
          company: string
          created_at: string
          display_name: string
          experience: Json
          id: string
          interests: string[]
          job_title: string
          location: string
          profile_completeness: number
          skills: string[]
          updated_at: string
          user_id: string
          website_url: string
          work_experience: Json
        }[]
      }
      get_safe_social_data: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          id: string
          platform: string
          processed_data: Json
          raw_data: Json
          updated_at: string
          user_id: string
        }[]
      }
      get_user_contact_secure: {
        Args: { target_user_id: string }
        Returns: {
          email: string
          phone_number: string
        }[]
      }
      get_user_email_for_contact: {
        Args: { target_user_id: string }
        Returns: string
      }
      search_public_profiles: {
        Args: { search_term: string }
        Returns: {
          ai_processed: boolean
          avatar_url: string
          bio: string
          company: string
          created_at: string
          display_name: string
          experience: Json
          id: string
          interests: string[]
          job_title: string
          location: string
          profile_completeness: number
          skills: string[]
          updated_at: string
          user_id: string
          website_url: string
          work_experience: Json
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
