export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem", borderBottom: "1px solid #1f1f1f", position: "sticky", top: 0,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <span style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
          Org<span style={{ color: "#3b82f6" }}>Hub</span>
        </span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: "0.9rem" }}>Features</a>
          <a href="#pricing" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: "0.9rem" }}>Pricing</a>
          <a href="https://github.com/davewilsn05/orghub-platform" target="_blank" rel="noopener noreferrer"
            style={{ color: "#a3a3a3", textDecoration: "none", fontSize: "0.9rem" }}>GitHub</a>
          <a href="/signup" style={{
            background: "#3b82f6", color: "#fff", padding: "0.5rem 1rem",
            borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
          }}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{
          display: "inline-block", background: "#1d2d3d", color: "#60a5fa",
          borderRadius: "999px", padding: "0.35rem 1rem", fontSize: "0.8rem",
          fontWeight: 600, letterSpacing: "0.05em", marginBottom: "1.5rem",
          border: "1px solid #2d4a6a",
        }}>
          Open source · MIT licensed · Self-hostable
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.5rem",
        }}>
          The member portal<br />
          <span style={{ color: "#3b82f6" }}>every nonprofit deserves</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#a3a3a3", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Events, committees, newsletters, messaging, and volunteer management —
          all in one open-source platform. Each org gets their own branded portal.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/signup" style={{
            background: "#3b82f6", color: "#fff", padding: "0.85rem 2rem",
            borderRadius: "10px", fontWeight: 700, fontSize: "1rem", textDecoration: "none",
          }}>
            Start for free →
          </a>
          <a href="https://github.com/davewilsn05/orghub-platform" target="_blank" rel="noopener noreferrer"
            style={{
              background: "#1a1a1a", color: "#f5f5f5", padding: "0.85rem 2rem",
              borderRadius: "10px", fontWeight: 700, fontSize: "1rem", textDecoration: "none",
              border: "1px solid #333",
            }}>
            ⭐ Star on GitHub
          </a>
        </div>
      </section>

      {/* Org type pills */}
      <section style={{ textAlign: "center", padding: "0 2rem 4rem" }}>
        <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1rem" }}>Built for any nonprofit</p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
          {["🦌 Elks Lodges", "🇮🇹 Cultural Societies", "🌀 Rotary Clubs", "🎖️ VFW Posts",
            "🦁 Lions Clubs", "🏡 HOAs", "⚽ Youth Leagues", "🌻 Garden Clubs",
            "🏛️ Civic Organizations", "🤝 Service Clubs"].map((label) => (
            <span key={label} style={{
              background: "#111", border: "1px solid #222", borderRadius: "999px",
              padding: "0.4rem 0.9rem", fontSize: "0.85rem", color: "#ccc",
            }}>{label}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          Everything your org needs
        </h2>
        <p style={{ textAlign: "center", color: "#a3a3a3", marginBottom: "3rem" }}>
          All features included. Toggle what you need per organization.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "14px",
              padding: "1.5rem",
            }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{f.title}</div>
              <div style={{ color: "#a3a3a3", fontSize: "0.9rem", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          Simple, honest pricing
        </h2>
        <p style={{ color: "#a3a3a3", marginBottom: "3rem" }}>
          Free forever for small orgs. Managed hosting for orgs that want zero setup.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem", maxWidth: "860px", margin: "0 auto",
        }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: plan.featured ? "#1d2d3d" : "#0f0f0f",
              border: `1px solid ${plan.featured ? "#3b82f6" : "#1f1f1f"}`,
              borderRadius: "16px", padding: "2rem", textAlign: "left",
            }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{plan.name}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                {plan.price}<span style={{ fontSize: "1rem", color: "#666" }}>{plan.period}</span>
              </div>
              <div style={{ color: "#a3a3a3", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{plan.desc}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "grid", gap: "0.5rem" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: "0.875rem", color: "#ccc" }}>✓ {f}</li>
                ))}
              </ul>
              <a href="/signup" style={{
                display: "block", textAlign: "center",
                background: plan.featured ? "#3b82f6" : "#1a1a1a",
                color: "#fff", padding: "0.75rem", borderRadius: "8px",
                fontWeight: 700, textDecoration: "none",
                border: plan.featured ? "none" : "1px solid #333",
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1a1a1a", padding: "2rem", textAlign: "center",
        color: "#555", fontSize: "0.875rem",
      }}>
        <p>OrgHub is open source under the MIT license.</p>
        <p style={{ marginTop: "0.5rem" }}>
          Built with Next.js + Supabase ·{" "}
          <a href="https://github.com/davewilsn05/orghub-platform" style={{ color: "#3b82f6" }}>
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: "🎭", title: "Events & RSVPs", desc: "Event hub with tickets, RSVPs, ICS downloads, and calendar views." },
  { icon: "🏛️", title: "Committee Management", desc: "Committee pages, goals, membership, and dedicated calendars." },
  { icon: "📰", title: "Newsletters", desc: "Rich text editor, draft/publish workflow, email blast to all members." },
  { icon: "💬", title: "Messaging", desc: "Internal messaging with inbox, sent, archive, and broadcast bulletins." },
  { icon: "⭐", title: "Volunteer Hub", desc: "Volunteer slots, signups, XP rewards, and QR check-in." },
  { icon: "📹", title: "Zoom Meetings", desc: "Embedded Zoom SDK, secure JWT signatures, meeting hub page." },
  { icon: "👥", title: "Member Directory", desc: "Searchable directory with privacy controls and role badges." },
  { icon: "🎨", title: "Per-org Branding", desc: "Custom colors, logos, and CSS variables — every org looks unique." },
  { icon: "🔒", title: "Role-based Access", desc: "Admin, board/council, committee chair, and member roles." },
  { icon: "📊", title: "Admin Dashboard", desc: "Events hub, member management, polls, minutes, and org settings." },
  { icon: "🌐", title: "Custom Domains", desc: "Each org gets a subdomain or bring your own domain." },
  { icon: "📂", title: "Documents", desc: "Bylaws, reports, health & safety — managed per org." },
];

const PLANS = [
  {
    name: "Self-hosted",
    price: "Free",
    period: " forever",
    desc: "Run OrgHub on your own infrastructure.",
    featured: false,
    cta: "Get the code",
    features: ["Unlimited members", "All features", "Your own Supabase", "MIT licensed", "Community support"],
  },
  {
    name: "Managed Cloud",
    price: "$49",
    period: "/mo per org",
    desc: "We run it. You focus on your members.",
    featured: true,
    cta: "Start free trial",
    features: ["Subdomain included", "Managed Supabase", "Email via SendGrid", "Automatic updates", "Priority support"],
  },
  {
    name: "Network",
    price: "Custom",
    period: "",
    desc: "Multiple orgs under one umbrella (e.g., all Elks lodges).",
    featured: false,
    cta: "Contact us",
    features: ["Unlimited orgs", "Central admin", "Shared member pool", "Custom domain", "Dedicated support"],
  },
];
