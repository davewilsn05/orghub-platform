import { NewsletterEditor } from "../NewsletterEditor";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Write Newsletter — Admin" };

export default async function NewNewsletterPage({ params }: Props) {
  const { orgSlug } = await params;
  return (
    <div style={{ padding: "2rem", maxWidth: "820px" }}>
      <a href={`/${orgSlug}/admin/newsletters`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Newsletters
      </a>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.75rem 0 1.75rem" }}>Write newsletter</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.75rem" }}>
        <NewsletterEditor orgSlug={orgSlug} />
      </div>
    </div>
  );
}
