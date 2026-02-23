export default function AdminDashboard() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>All Organizations</h1>
      <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>Platform-wide view of all provisioned orgs.</p>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Orgs", value: "—" },
          { label: "Active Members", value: "—" },
          { label: "Events This Month", value: "—" },
          { label: "Emails Sent", value: "—" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "12px", padding: "1.25rem",
          }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>{stat.value}</div>
            <div style={{ color: "#a3a3a3", fontSize: "0.875rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Org table placeholder */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Organizations</h2>
          <a href="/orgs/new" style={{
            background: "#3b82f6", color: "#fff", padding: "0.5rem 1rem",
            borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
          }}>
            + Provision org
          </a>
        </div>
        <p style={{ color: "#555", fontSize: "0.875rem" }}>
          Connect to Supabase to list organizations. Run migrations first: <code>supabase db push</code>
        </p>
      </div>
    </div>
  );
}
