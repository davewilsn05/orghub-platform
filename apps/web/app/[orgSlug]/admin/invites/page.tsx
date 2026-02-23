import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { InvitesList } from "./InvitesList";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Invites — Admin" };

export default async function AdminInvitesPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("invites")
    .select("id, email, role, accepted_at, expires_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const invites = (data ?? []) as {
    id: string; email: string; role: string;
    accepted_at: string | null; expires_at: string; created_at: string;
  }[];

  return (
    <div style={{ padding: "2rem", maxWidth: "860px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Invites</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Invite people to join {org.name}. Links expire after 7 days.
      </p>
      <InvitesList orgSlug={orgSlug} initial={invites} />
    </div>
  );
}
