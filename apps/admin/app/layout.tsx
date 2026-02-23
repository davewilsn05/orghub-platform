import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrgHub Admin",
  description: "Platform super-admin dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#0a0a0a", color: "#f5f5f5" }}>
        <nav style={{
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "1rem 2rem", borderBottom: "1px solid #1f1f1f", background: "#0a0a0a",
        }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
            Org<span style={{ color: "#3b82f6" }}>Hub</span>
            <span style={{ color: "#555", fontWeight: 400, fontSize: "0.85rem", marginLeft: "0.5rem" }}>Platform Admin</span>
          </span>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
