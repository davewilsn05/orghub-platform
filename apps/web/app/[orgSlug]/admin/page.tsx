import { loadOrgConfig } from "@/lib/org/loader";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const [memberRes, eventRes, draftRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("is_active", true),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("is_published", true),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("is_published", false),
  ]);

  const stats = [
    { label: "Active members", value: memberRes.count ?? 0, icon: "👥", href: `/${orgSlug}/admin/members` },
    { label: "Published events", value: eventRes.count ?? 0, icon: "📅", href: `/${orgSlug}/admin/events` },
    { label: "Draft events", value: draftRes.count ?? 0, icon: "✏️", href: `/${orgSlug}/admin/events` },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Overview</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9rem" }}>{org.name}</p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {stats.map((s) => (
          <a key={s.label} href={s.href} style={{
            display: "block", background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: "12px", padding: "1.25rem", textDecoration: "none", color: "inherit",
          }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.15rem" }}>{s.label}</div>
          </a>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
        Quick actions
      </h2>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <ActionBtn href={`/${orgSlug}/admin/events/new`} label="Create event" icon="➕" primary />
        <ActionBtn href={`/${orgSlug}/admin/members`} label="Manage members" icon="👥" />
      </div>
    </div>
  );
}

function ActionBtn({ href, label, icon, primary }: { href: string; label: string; icon: string; primary?: boolean }) {
  return (
    <a href={href} style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.65rem 1.25rem", borderRadius: "8px", fontWeight: 600,
      fontSize: "0.875rem", textDecoration: "none",
      background: primary ? "var(--org-primary, #3b82f6)" : "#fff",
      color: primary ? "#fff" : "#374151",
      border: primary ? "none" : "1px solid #d1d5db",
    }}>
      {icon} {label}
    </a>
  );
}
