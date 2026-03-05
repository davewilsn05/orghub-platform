import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";
import { AdminNav } from "./AdminNav";
import AdminAssistantWidget from "./components/AdminAssistantWidget";

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
    { href: `/${orgSlug}/admin/newsletters`, label: "Newsletters", icon: "📰" },
    { href: `/${orgSlug}/admin/membership-plans`, label: "Membership Plans", icon: "💳" },
    { href: `/${orgSlug}/admin/orders`, label: "Ticket Orders", icon: "🎟️" },
    { href: `/${orgSlug}/admin/settings`, label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <AdminNav orgSlug={orgSlug} orgName={org.name} links={links} />

      {/* Content */}
      <main style={{ flex: 1, background: "#f9fafb" }}>
        {children}
      </main>

      <AdminAssistantWidget orgName={org.name} orgSlug={orgSlug} />
    </div>
  );
}
