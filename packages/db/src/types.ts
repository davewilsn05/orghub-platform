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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      committee_members: {
        Row: {
          committee_id: string
          id: string
          joined_at: string
          org_id: string
          profile_id: string
          role: string
        }
        Insert: {
          committee_id: string
          id?: string
          joined_at?: string
          org_id: string
          profile_id: string
          role?: string
        }
        Update: {
          committee_id?: string
          id?: string
          joined_at?: string
          org_id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          chair_profile_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          chair_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          chair_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committees_chair_profile_id_fkey"
            columns: ["chair_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          org_id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          org_id: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          org_id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          org_id: string
          profile_id: string
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          org_id: string
          profile_id: string
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          org_id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end: string | null
          id: string
          image_url: string | null
          is_published: boolean
          is_zoom_meeting: boolean
          location: string | null
          org_id: string
          rsvp_enabled: boolean
          rsvp_limit: number | null
          slug: string
          start: string
          title: string
          updated_at: string
          zoom_meeting_id: string | null
          zoom_passcode: string | null
          zoom_url: string | null
        }
        Insert: {
          all_day?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          is_zoom_meeting?: boolean
          location?: string | null
          org_id: string
          rsvp_enabled?: boolean
          rsvp_limit?: number | null
          slug: string
          start: string
          title: string
          updated_at?: string
          zoom_meeting_id?: string | null
          zoom_passcode?: string | null
          zoom_url?: string | null
        }
        Update: {
          all_day?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          is_zoom_meeting?: boolean
          location?: string | null
          org_id?: string
          rsvp_enabled?: boolean
          rsvp_limit?: number | null
          slug?: string
          start?: string
          title?: string
          updated_at?: string
          zoom_meeting_id?: string | null
          zoom_passcode?: string | null
          zoom_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          id: string
          is_archived: boolean
          is_read: boolean
          message_id: string
          org_id: string
          profile_id: string
          read_at: string | null
        }
        Insert: {
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message_id: string
          org_id: string
          profile_id: string
          read_at?: string | null
        }
        Update: {
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message_id?: string
          org_id?: string
          profile_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audience: Database["public"]["Enums"]["message_audience"]
          audience_ref: string | null
          body: string
          created_at: string
          id: string
          org_id: string
          sender_id: string | null
          sent_at: string | null
          subject: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["message_audience"]
          audience_ref?: string | null
          body: string
          created_at?: string
          id?: string
          org_id: string
          sender_id?: string | null
          sent_at?: string | null
          subject: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["message_audience"]
          audience_ref?: string | null
          body?: string
          created_at?: string
          id?: string
          org_id?: string
          sender_id?: string | null
          sent_at?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          published_at: string | null
          sent_at: string | null
          slug: string
          status: Database["public"]["Enums"]["newsletter_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          published_at?: string | null
          sent_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          published_at?: string | null
          sent_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          custom_domain: string | null
          favicon_url: string | null
          feature_committees: boolean
          feature_documents: boolean
          feature_events: boolean
          feature_member_directory: boolean
          feature_messaging: boolean
          feature_newsletters: boolean
          feature_volunteers: boolean
          feature_zoom: boolean
          id: string
          logo_url: string | null
          name: string
          plan: Database["public"]["Enums"]["org_plan"]
          primary_color: string | null
          secondary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          feature_committees?: boolean
          feature_documents?: boolean
          feature_events?: boolean
          feature_member_directory?: boolean
          feature_messaging?: boolean
          feature_newsletters?: boolean
          feature_volunteers?: boolean
          feature_zoom?: boolean
          id?: string
          logo_url?: string | null
          name: string
          plan?: Database["public"]["Enums"]["org_plan"]
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          feature_committees?: boolean
          feature_documents?: boolean
          feature_events?: boolean
          feature_member_directory?: boolean
          feature_messaging?: boolean
          feature_newsletters?: boolean
          feature_volunteers?: boolean
          feature_zoom?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["org_plan"]
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          joined_at: string | null
          org_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          joined_at?: string | null
          org_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string | null
          org_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_signups: {
        Row: {
          checked_in_at: string | null
          id: string
          org_id: string
          profile_id: string
          signed_up_at: string
          slot_id: string
        }
        Insert: {
          checked_in_at?: string | null
          id?: string
          org_id: string
          profile_id: string
          signed_up_at?: string
          slot_id: string
        }
        Update: {
          checked_in_at?: string | null
          id?: string
          org_id?: string
          profile_id?: string
          signed_up_at?: string
          slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_signups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_signups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_signups_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "volunteer_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_slots: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          event_id: string | null
          id: string
          org_id: string
          spots_filled: number
          spots_total: number
          title: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          org_id: string
          spots_filled?: number
          spots_total?: number
          title: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          org_id?: string
          spots_filled?: number
          spots_total?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_slots_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_slots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      current_org_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      is_admin_or_board: { Args: never; Returns: boolean }
    }
    Enums: {
      message_audience: "all" | "board" | "committee" | "individual"
      newsletter_status: "draft" | "published" | "sent"
      org_plan: "free" | "managed" | "network"
      rsvp_status: "attending" | "not_attending" | "maybe"
      user_role: "member" | "committee_chair" | "board" | "admin"
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
    Enums: {
      message_audience: ["all", "board", "committee", "individual"],
      newsletter_status: ["draft", "published", "sent"],
      org_plan: ["free", "managed", "network"],
      rsvp_status: ["attending", "not_attending", "maybe"],
      user_role: ["member", "committee_chair", "board", "admin"],
    },
  },
} as const
