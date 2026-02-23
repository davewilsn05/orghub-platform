import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";

type Props = {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orgRole = user?.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    redirect(`/${orgSlug}/dashboard`);
  }

  const org = await loadOrgConfig();

  const links = [
    { href: `/${orgSlug}/admin`, label: "Overview", icon: "📊" },
    { href: `/${orgSlug}/admin/events`, label: "Events", icon: "📅" },
    { href: `/${orgSlug}/admin/members`, label: "Members", icon: "👥" },
    { href: `/${orgSlug}/admin/invites`, label: "Invites", icon: "✉️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "216px", flexShrink: 0,
        background: "#fff", borderRight: "1px solid #e5e7eb",
        padding: "1.5rem 0", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", borderBottom: "1px solid #f3f4f6", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: "0.3rem" }}>
            Admin Panel
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{org.name}</div>
        </div>

        <nav style={{ flex: 1 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: "0.65rem",
              padding: "0.6rem 1.25rem", fontSize: "0.875rem",
              fontWeight: 500, color: "#374151", textDecoration: "none",
            }}>
              <span>{l.icon}</span>{l.label}
            </a>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
          <a href={`/${orgSlug}/dashboard`} style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            padding: "0.6rem 1.25rem", fontSize: "0.825rem",
            color: "#9ca3af", textDecoration: "none",
          }}>
            ← Back to portal
          </a>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, background: "#f9fafb" }}>
        {children}
      </main>
    </div>
  );
}
