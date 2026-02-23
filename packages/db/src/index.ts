export type { Database, Json } from "./types";
import type { Database } from "./types";

type Tables = Database["public"]["Tables"];

export type OrgRow = Tables["organizations"]["Row"];
export type ProfileRow = Tables["profiles"]["Row"];
export type EventRow = Tables["events"]["Row"];
export type EventRsvpRow = Tables["event_rsvps"]["Row"];
export type CommitteeRow = Tables["committees"]["Row"];
export type CommitteeMemberRow = Tables["committee_members"]["Row"];
export type MessageRow = Tables["messages"]["Row"];
export type MessageRecipientRow = Tables["message_recipients"]["Row"];
export type NewsletterRow = Tables["newsletters"]["Row"];
export type VolunteerSlotRow = Tables["volunteer_slots"]["Row"];
export type VolunteerSignupRow = Tables["volunteer_signups"]["Row"];
export type DocumentRow = Tables["documents"]["Row"];
export type InviteRow = Tables["invites"]["Row"];
