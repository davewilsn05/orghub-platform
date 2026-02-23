import { loadOrgConfig } from "@/lib/org/loader";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { orgSlug } = await params;
  return { title: `Sign in — ${orgSlug}` };
}

export default async function LoginPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();

  // Already logged in — send to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(`/${orgSlug}/dashboard`);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Org branding */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {org.branding.logoUrl ? (
            <img
              src={org.branding.logoUrl}
              alt={org.name}
              style={{ height: "48px", marginBottom: "1rem", objectFit: "contain" }}
            />
          ) : (
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "var(--org-primary, #3b82f6)",
              margin: "0 auto 1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "1.25rem",
            }}>
              {org.name.charAt(0)}
            </div>
          )}
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#111827" }}>
            {org.name}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Members Portal
          </p>
        </div>

        <LoginForm
          orgName={org.name}
          primaryColor={org.branding.primaryColor}
        />
      </div>
    </div>
  );
}
