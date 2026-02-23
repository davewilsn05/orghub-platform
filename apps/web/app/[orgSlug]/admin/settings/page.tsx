import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage({ params }: Props) {
  await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data: row } = await supabase
    .from("organizations")
    .select("name, primary_color, secondary_color, logo_url, favicon_url, feature_events, feature_committees, feature_newsletters, feature_messaging, feature_volunteers, feature_zoom, feature_documents, feature_member_directory")
    .eq("id", org.id)
    .single();

  if (!row) return <div style={{ padding: "2rem" }}>Organization not found.</div>;

  type OrgRow = typeof row;

  return (
    <div style={{ padding: "2rem", maxWidth: "720px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Settings</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Manage your portal identity, branding, and enabled features.
      </p>
      <SettingsForm initial={row as OrgRow} />
    </div>
  );
}
