import { loadOrgConfig } from "@/lib/org/loader";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Newsletters" };

type NL = { id: string; title: string; slug: string; published_at: string | null };

export default async function NewslettersPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("newsletters")
    .select("id, title, slug, published_at")
    .eq("org_id", org.id)
    .in("status", ["published", "sent"])
    .order("published_at", { ascending: false });

  const newsletters = (data ?? []) as NL[];

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>Newsletters</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{org.name}</p>

      {!newsletters.length ? (
        <p style={{ color: "#9ca3af", fontStyle: "italic" }}>No newsletters published yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {newsletters.map((nl) => (
            <a key={nl.id} href={`/${orgSlug}/newsletters/${nl.id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1.1rem 1.25rem", background: "#fff",
              border: "1px solid #e5e7eb", borderRadius: "10px",
              textDecoration: "none", color: "inherit",
            }}>
              <span style={{ fontWeight: 600 }}>{nl.title}</span>
              <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
                {nl.published_at ? new Date(nl.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
