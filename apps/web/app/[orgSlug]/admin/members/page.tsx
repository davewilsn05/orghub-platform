import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { MembersTable } from "./MembersTable";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Members — Admin" };

type Profile = {
  id: string; full_name: string | null; email: string;
  role: string; is_active: boolean; joined_at: string | null; created_at: string;
};


export default async function AdminMembersPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const LIMIT = 500;
  const { data, count } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, joined_at, created_at", { count: "exact" })
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  const members = data as Profile[] | null;
  const active = members?.filter((m) => m.is_active).length ?? 0;
  const truncated = (count ?? 0) > LIMIT;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Members</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {active} active · {truncated ? `Showing ${LIMIT} of ${count ?? "?"} total` : `${members?.length ?? 0} total`}
          </p>
        </div>
        <a
          href="/api/admin/members/export"
          style={{
            padding: "0.6rem 1.25rem", background: "#f3f4f6",
            border: "1px solid #e5e7eb", borderRadius: "8px",
            fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
            color: "#374151",
          }}
        >
          Export CSV
        </a>
      </div>

      {!members?.length ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
          color: "#9ca3af",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👥</div>
          <p style={{ fontWeight: 600 }}>No members yet</p>
        </div>
      ) : (
        <MembersTable members={members} />
      )}
    </div>
  );
}
