import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Newsletters — Admin" };

type NL = { id: string; title: string; slug: string; status: string; published_at: string | null; sent_at: string | null; created_at: string };

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: "#f3f4f6", color: "#374151", label: "Draft" },
  published: { bg: "#dbeafe", color: "#1d4ed8", label: "Published" },
  sent: { bg: "#d1fae5", color: "#065f46", label: "Sent" },
};

export default async function AdminNewslettersPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("newsletters")
    .select("id, title, slug, status, published_at, sent_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const newsletters = (data ?? []) as NL[];

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Newsletters</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>{newsletters.length} total</p>
        </div>
        <a href={`/${orgSlug}/admin/newsletters/new`} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.65rem 1.25rem", background: "var(--org-primary, #3b82f6)", color: "#fff",
          borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
        }}>
          ➕ Write newsletter
        </a>
      </div>

      {!newsletters.length ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📰</div>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No newsletters yet</p>
          <a href={`/${orgSlug}/admin/newsletters/new`} style={{ color: "var(--org-primary, #3b82f6)", fontWeight: 600, fontSize: "0.875rem" }}>
            Write your first newsletter →
          </a>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["Title", "Status", "Published", "Sent", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {newsletters.map((nl) => {
                const s = STATUS_STYLE[nl.status] ?? { bg: "#f3f4f6", color: "#374151", label: nl.status };
                return (
                  <tr key={nl.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>{nl.title}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280", fontSize: "0.82rem" }}>
                      {nl.published_at ? new Date(nl.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280", fontSize: "0.82rem" }}>
                      {nl.sent_at ? new Date(nl.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <a href={`/${orgSlug}/admin/newsletters/${nl.id}/edit`} style={{ color: "var(--org-primary, #3b82f6)", fontWeight: 600, textDecoration: "none", fontSize: "0.825rem" }}>
                        Edit
                      </a>
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
