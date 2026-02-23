/**
 * Generated database type definitions for OrgHub multi-tenant schema.
 * These mirror the Supabase migrations in /supabase/migrations/.
 *
 * Run `supabase gen types typescript` to regenerate from a live DB.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          plan: "free" | "managed" | "network";
          primary_color: string | null;
          secondary_color: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          feature_events: boolean;
          feature_committees: boolean;
          feature_newsletters: boolean;
          feature_messaging: boolean;
          feature_volunteers: boolean;
          feature_zoom: boolean;
          feature_documents: boolean;
          feature_member_directory: boolean;
          custom_domain: string | null;
          billing_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["organizations"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["organizations"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };

      profiles: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          full_name: string | null;
          role: "member" | "committee_chair" | "board" | "admin";
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["profiles"]["Row"],
              "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };

      events: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          slug: string;
          description: string | null;
          location: string | null;
          start: string;
          end: string | null;
          all_day: boolean;
          category: string | null;
          image_url: string | null;
          is_published: boolean;
          rsvp_enabled: boolean;
          rsvp_limit: number | null;
          is_zoom_meeting: boolean;
          zoom_url: string | null;
          zoom_meeting_id: string | null;
          zoom_passcode: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["events"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["events"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };

      event_rsvps: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          profile_id: string;
          status: "attending" | "not_attending" | "maybe";
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["event_rsvps"]["Row"],
          "id" | "created_at"
        > &
          Partial<Pick<Database["public"]["Tables"]["event_rsvps"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["event_rsvps"]["Row"]>;
      };

      committees: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          slug: string;
          description: string | null;
          chair_profile_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["committees"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["committees"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["committees"]["Row"]>;
      };

      committee_members: {
        Row: {
          id: string;
          org_id: string;
          committee_id: string;
          profile_id: string;
          role: "chair" | "member";
          joined_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["committee_members"]["Row"],
          "id" | "joined_at"
        > &
          Partial<Pick<Database["public"]["Tables"]["committee_members"]["Row"], "id" | "joined_at">>;
        Update: Partial<Database["public"]["Tables"]["committee_members"]["Row"]>;
      };

      messages: {
        Row: {
          id: string;
          org_id: string;
          subject: string;
          body: string;
          sender_id: string | null;
          audience: "all" | "board" | "committee" | "individual";
          audience_ref: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["messages"]["Row"],
          "id" | "created_at"
        > &
          Partial<Pick<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };

      message_recipients: {
        Row: {
          id: string;
          org_id: string;
          message_id: string;
          profile_id: string;
          is_read: boolean;
          is_archived: boolean;
          read_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["message_recipients"]["Row"],
          "id"
        > &
          Partial<Pick<Database["public"]["Tables"]["message_recipients"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["message_recipients"]["Row"]>;
      };

      newsletters: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          slug: string;
          content: Json;
          status: "draft" | "published" | "sent";
          published_at: string | null;
          sent_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["newsletters"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["newsletters"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["newsletters"]["Row"]>;
      };

      volunteer_slots: {
        Row: {
          id: string;
          org_id: string;
          event_id: string | null;
          title: string;
          description: string | null;
          date: string | null;
          spots_total: number;
          spots_filled: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["volunteer_slots"]["Row"],
          "id" | "created_at"
        > &
          Partial<Pick<Database["public"]["Tables"]["volunteer_slots"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["volunteer_slots"]["Row"]>;
      };

      volunteer_signups: {
        Row: {
          id: string;
          org_id: string;
          slot_id: string;
          profile_id: string;
          signed_up_at: string;
          checked_in_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["volunteer_signups"]["Row"],
          "id" | "signed_up_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["volunteer_signups"]["Row"],
              "id" | "signed_up_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["volunteer_signups"]["Row"]>;
      };

      documents: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          category: string | null;
          file_url: string;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["documents"]["Row"],
          "id" | "created_at"
        > &
          Partial<Pick<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "member" | "committee_chair" | "board" | "admin";
      org_plan: "free" | "managed" | "network";
      message_audience: "all" | "board" | "committee" | "individual";
      newsletter_status: "draft" | "published" | "sent";
      rsvp_status: "attending" | "not_attending" | "maybe";
    };
  };
}

/** Shorthand row types */
export type OrgRow = Database["public"]["Tables"]["organizations"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventRsvpRow = Database["public"]["Tables"]["event_rsvps"]["Row"];
export type CommitteeRow = Database["public"]["Tables"]["committees"]["Row"];
export type CommitteeMemberRow = Database["public"]["Tables"]["committee_members"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageRecipientRow = Database["public"]["Tables"]["message_recipients"]["Row"];
export type NewsletterRow = Database["public"]["Tables"]["newsletters"]["Row"];
export type VolunteerSlotRow = Database["public"]["Tables"]["volunteer_slots"]["Row"];
export type VolunteerSignupRow = Database["public"]["Tables"]["volunteer_signups"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
