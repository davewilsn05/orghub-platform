import { notFound } from "next/navigation";
import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string; id: string }> };

export default async function NewsletterPage({ params }: Props) {
  const { orgSlug, id } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("newsletters")
    .select("id, title, content, published_at, status")
    .eq("id", id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!data) notFound();

  const nl = data as { id: string; title: string; content: { text?: string } | null; published_at: string | null; status: string };
  if (nl.status === "draft") notFound();

  const body = nl.content?.text ?? "";

  return (
    <main style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
      <a href={`/${orgSlug}/newsletters`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Newsletters
      </a>

      <div style={{ marginTop: "1.25rem" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "0.5rem" }}>
          {org.name}
          {nl.published_at && (
            <> · {new Date(nl.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
          )}
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", lineHeight: 1.2 }}>{nl.title}</h1>
        <div style={{
          color: "#374151", lineHeight: 1.8, fontSize: "1rem",
          whiteSpace: "pre-wrap",
          borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem",
        }}>
          {body || <em style={{ color: "#9ca3af" }}>No content.</em>}
        </div>
      </div>
    </main>
  );
}
