import { notFound } from "next/navigation";
import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { JoinForm } from "./JoinForm";

type Props = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata = { title: "Join — Member Portal" };

export default async function JoinPage({ params, searchParams }: Props) {
  const { orgSlug } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data: invite } = await supabase
    .from("invites")
    .select("id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!invite) {
    return <InviteError message="This invite link is invalid or doesn't belong to this portal." orgName={org.name} />;
  }

  if (invite.accepted_at) {
    return <InviteError message="This invite has already been used. Try logging in." orgName={org.name} />;
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <InviteError message="This invite link has expired. Ask your admin for a new one." orgName={org.name} />;
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f9fafb", padding: "2rem",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {org.branding.logoUrl && (
          <img src={org.branding.logoUrl} alt={org.name}
            style={{ height: "48px", objectFit: "contain", display: "block", marginBottom: "1.5rem" }} />
        )}
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
          Create your account
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
          {org.name}
        </p>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.75rem" }}>
          <JoinForm
            token={token}
            email={invite.email}
            orgName={org.name}
            orgSlug={orgSlug}
          />
        </div>
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.82rem", color: "#9ca3af" }}>
          Already have an account?{" "}
          <a href={`/${orgSlug}/login`} style={{ color: "var(--org-primary, #3b82f6)" }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

function InviteError({ message, orgName }: { message: string; orgName: string }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f9fafb", padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔗</div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Invalid invite</h1>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>{message}</p>
        <a href="/" style={{
          display: "inline-block", padding: "0.65rem 1.25rem",
          background: "var(--org-primary, #3b82f6)", color: "#fff",
          borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.875rem",
        }}>
          Go to {orgName}
        </a>
      </div>
    </div>
  );
}
