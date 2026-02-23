import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Members — Admin" };

type Profile = {
  id: string; full_name: string | null; email: string;
  role: string; is_active: boolean; joined_at: string | null; created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", board: "Board", committee_chair: "Committee Chair", member: "Member",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#dbeafe", color: "#1d4ed8" },
  board: { bg: "#ede9fe", color: "#6d28d9" },
  committee_chair: { bg: "#fef9c3", color: "#92400e" },
  member: { bg: "#f3f4f6", color: "#374151" },
};

export default async function AdminMembersPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, joined_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const members = data as Profile[] | null;
  const active = members?.filter((m) => m.is_active).length ?? 0;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Members</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {active} active · {members?.length ?? 0} total
          </p>
        </div>
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
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                  <th key={h} style={{
                    padding: "0.75rem 1rem", textAlign: "left",
                    fontWeight: 600, color: "#6b7280", fontSize: "0.78rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const roleStyle = ROLE_COLORS[m.role] ?? { bg: "#f3f4f6", color: "#374151" };
                const joined = m.joined_at ?? m.created_at;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>
                      {m.full_name ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>{m.email}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: roleStyle.bg, color: roleStyle.color,
                      }}>
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: m.is_active ? "#d1fae5" : "#f3f4f6",
                        color: m.is_active ? "#065f46" : "#9ca3af",
                      }}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.82rem" }}>
                      {new Date(joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
