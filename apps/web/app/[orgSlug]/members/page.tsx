import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { MemberSearch } from "./MemberSearch";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Members" };

export default async function MembersPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, joined_at, created_at")
    .eq("org_id", org.id)
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  type Member = { id: string; full_name: string | null; email: string; role: string; joined_at: string | null; created_at: string };
  const members = (data ?? []) as Member[];

  return (
    <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>Member Directory</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{members.length} active members · {org.name}</p>
      <MemberSearch members={members} orgSlug={orgSlug} />
    </main>
  );
}
