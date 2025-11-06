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
      circle_members: {
        Row: {
          added_at: string | null
          circle_id: string
          contact_id: string
          id: string
          position_x: number | null
          position_y: number | null
          position_z: number | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          circle_id: string
          contact_id: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          circle_id?: string
          contact_id?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      connection_meetings: {
        Row: {
          connection_id: string
          created_at: string
          event_id: string | null
          id: string
          meeting_date: string | null
          meeting_location: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          meeting_date?: string | null
          meeting_location?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          meeting_date?: string | null
          meeting_location?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_meetings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_meetings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          met_at_event_id: string | null
          notes: string | null
          source: string | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          met_at_event_id?: string | null
          notes?: string | null
          source?: string | null
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          met_at_event_id?: string | null
          notes?: string | null
          source?: string | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_met_at_event_id_fkey"
            columns: ["met_at_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      event_attendances: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          eventbrite_id: string
          id: string
          image_url: string | null
          name: string
          start_date: string
          tags: string[] | null
          updated_at: string
          url: string | null
          venue_address: string | null
          venue_city: string | null
          venue_name: string | null
          venue_state: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          eventbrite_id: string
          id?: string
          image_url?: string | null
          name: string
          start_date: string
          tags?: string[] | null
          updated_at?: string
          url?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          eventbrite_id?: string
          id?: string
          image_url?: string | null
          name?: string
          start_date?: string
          tags?: string[] | null
          updated_at?: string
          url?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
          venue_state?: string | null
        }
        Relationships: []
      }
      health_scores: {
        Row: {
          calculated_at: string | null
          consistency_score: number | null
          contact_id: string
          frequency_score: number | null
          id: string
          last_contact_days: number | null
          recency_score: number | null
          reciprocity_score: number | null
          score: number | null
          total_interactions: number | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          consistency_score?: number | null
          contact_id: string
          frequency_score?: number | null
          id?: string
          last_contact_days?: number | null
          recency_score?: number | null
          reciprocity_score?: number | null
          score?: number | null
          total_interactions?: number | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          consistency_score?: number | null
          contact_id?: string
          frequency_score?: number | null
          id?: string
          last_contact_days?: number | null
          recency_score?: number | null
          reciprocity_score?: number | null
          score?: number | null
          total_interactions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
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
          direction: string | null
          duration_minutes: number | null
          id: string
          metadata: Json | null
          notes: string | null
          occurred_at: string | null
          quality_rating: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          date: string
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          occurred_at?: string | null
          quality_rating?: number | null
          type: string
          user_id?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          date?: string
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          occurred_at?: string | null
          quality_rating?: number | null
          type?: string
          user_id?: string | null
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
          circles_onboarded: boolean | null
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
          circles_onboarded?: boolean | null
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
          circles_onboarded?: boolean | null
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
      relationship_goals: {
        Row: {
          contact_frequency_days: number | null
          contact_id: string
          created_at: string | null
          id: string
          monthly_call_minutes: number | null
          monthly_messages: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_frequency_days?: number | null
          contact_id: string
          created_at?: string | null
          id?: string
          monthly_call_minutes?: number | null
          monthly_messages?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_frequency_days?: number | null
          contact_id?: string
          created_at?: string | null
          id?: string
          monthly_call_minutes?: number | null
          monthly_messages?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_goals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
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
