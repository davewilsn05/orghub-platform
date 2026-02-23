import { notFound } from "next/navigation";
import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { NewsletterEditor } from "../../NewsletterEditor";

type Props = { params: Promise<{ orgSlug: string; id: string }> };

export const metadata = { title: "Edit Newsletter — Admin" };

export default async function EditNewsletterPage({ params }: Props) {
  const { orgSlug, id } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("newsletters")
    .select("id, title, slug, content, status")
    .eq("id", id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!data) notFound();

  const nl = data as { id: string; title: string; slug: string; content: { text?: string } | null; status: string };
  const body = nl.content?.text ?? "";

  return (
    <div style={{ padding: "2rem", maxWidth: "820px" }}>
      <a href={`/${orgSlug}/admin/newsletters`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Newsletters
      </a>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.75rem 0 1.75rem" }}>Edit newsletter</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.75rem" }}>
        <NewsletterEditor orgSlug={orgSlug} newsletter={{ id: nl.id, title: nl.title, body, status: nl.status }} />
      </div>
    </div>
  );
}
