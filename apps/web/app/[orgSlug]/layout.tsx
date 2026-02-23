import { loadOrgConfig } from "@/lib/org/loader";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
};

export default async function OrgLayout({ children, params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();

  if (org.id === "00000000-0000-0000-0000-000000000000" && orgSlug !== "demo") {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgRole = user?.app_metadata?.org_role as string | undefined;
  const isAdmin = orgRole === "admin" || orgRole === "board";

  const navLinks = [
    { href: `/${orgSlug}/events`, label: "Events", show: org.features.events },
    { href: `/${orgSlug}/committees`, label: "Committees", show: org.features.committees },
    { href: `/${orgSlug}/newsletters`, label: "Newsletters", show: org.features.newsletters },
    { href: `/${orgSlug}/messages`, label: "Messages", show: org.features.messaging },
    { href: `/${orgSlug}/members`, label: "Directory", show: org.features.memberDirectory },
    { href: `/${orgSlug}/volunteer`, label: "Volunteer", show: org.features.volunteers },
    { href: `/${orgSlug}/meetings`, label: "Meetings", show: org.features.zoom },
  ].filter((l) => l.show);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <a
          href={`/${orgSlug}/dashboard`}
          style={{
            fontWeight: 800, fontSize: "1.05rem",
            textDecoration: "none",
            color: "var(--org-primary, #3b82f6)",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}
        >
          {org.branding.logoUrl && (
            <img src={org.branding.logoUrl} alt="" style={{ height: "28px", objectFit: "contain" }} />
          )}
          {org.name}
        </a>

        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {isAdmin && (
            <a href={`/${orgSlug}/admin`} style={{
              padding: "0.4rem 0.75rem", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 600,
              color: "var(--org-primary, #3b82f6)", textDecoration: "none",
            }}>
              Admin
            </a>
          )}
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user && (
            <a href={`/${orgSlug}/profile`} style={{
              fontSize: "0.8rem", color: "#6b7280",
              textDecoration: "none", borderBottom: "1px dotted #d1d5db",
            }}>
              {user.email}
            </a>
          )}
          <form action={`/${orgSlug}/auth/signout`} method="POST">
            <button
              type="submit"
              style={{
                padding: "0.375rem 0.875rem",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                color: "#374151",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div>{children}</div>
    </div>
  );
}
