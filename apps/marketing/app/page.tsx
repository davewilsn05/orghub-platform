const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0f0f0", overflowX: "hidden" }}>
      <Nav appUrl={APP_URL} />
      <Hero appUrl={APP_URL} />
      <OrgTypes />
      <DashboardMockup />
      <Features />
      <HowItWorks appUrl={APP_URL} />
      <Pricing appUrl={APP_URL} />
      <Faq />
      <ClosingCta appUrl={APP_URL} />
      <Footer />
    </div>
  );
}

/* ─── Nav ──────────────────────────────────────────────────────────── */

function Nav({ appUrl }: { appUrl: string }) {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.1rem 2rem", position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,8,8,0.88)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid #161616",
    }}>
      <span style={{ fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-0.03em" }}>
        Org<span style={{ color: "#3b82f6" }}>Hub</span>
      </span>
      <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
        <a href="#features" style={navLink}>Features</a>
        <a href="#how-it-works" style={navLink}>How it works</a>
        <a href="#pricing" style={navLink}>Pricing</a>
        <a
          href="https://github.com/davewilsn05/orghub-platform"
          target="_blank" rel="noopener noreferrer"
          style={navLink}
        >GitHub</a>
        <a href={`${appUrl}/register`} style={btnPrimary}>Get started free →</a>
      </div>
    </nav>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function Hero({ appUrl }: { appUrl: string }) {
  return (
    <section style={{ textAlign: "center", padding: "6rem 2rem 3.5rem", position: "relative" }}>
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "400px", pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
      }} />

      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.5rem",
        background: "#0d1f33", color: "#60a5fa",
        borderRadius: "999px", padding: "0.4rem 1.1rem", fontSize: "0.8rem",
        fontWeight: 600, letterSpacing: "0.04em", marginBottom: "1.75rem",
        border: "1px solid #1e3a5f",
      }}>
        <span style={{ background: "#3b82f6", borderRadius: "50%", width: "6px", height: "6px", display: "inline-block" }} />
        Open source · MIT licensed · Self-hostable
      </div>

      <h1 style={{
        fontSize: "clamp(2.6rem, 6.5vw, 4.25rem)", fontWeight: 900,
        lineHeight: 1.08, letterSpacing: "-0.035em", marginBottom: "1.5rem",
        maxWidth: "820px", margin: "0 auto 1.5rem",
      }}>
        The member portal<br />
        <span style={{ color: "#3b82f6" }}>every nonprofit deserves</span>
      </h1>

      <p style={{
        fontSize: "1.2rem", color: "#8a8a8a", maxWidth: "580px",
        margin: "0 auto 2.75rem", lineHeight: 1.65,
      }}>
        Events, committees, newsletters, and messaging — all in one
        branded portal. Each organization gets their own subdomain in minutes.
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <a href={`${appUrl}/register`} style={{
          ...btnPrimary, padding: "0.95rem 2.25rem", fontSize: "1.05rem",
        }}>
          Start for free →
        </a>
        <a
          href="https://github.com/davewilsn05/orghub-platform"
          target="_blank" rel="noopener noreferrer"
          style={{
            background: "#111", color: "#e0e0e0", padding: "0.95rem 2.25rem",
            borderRadius: "10px", fontWeight: 700, fontSize: "1.05rem",
            textDecoration: "none", border: "1px solid #2a2a2a",
          }}
        >
          ☆ Star on GitHub
        </a>
      </div>

      <p style={{ color: "#444", fontSize: "0.82rem" }}>
        No credit card required · Portal live in 60 seconds
      </p>
    </section>
  );
}

/* ─── Org type pills ────────────────────────────────────────────────── */

function OrgTypes() {
  const orgs = [
    "Elks Lodges", "Cultural Societies", "Rotary Clubs",
    "VFW Posts", "American Legion Posts", "Lions Clubs",
    "HOAs", "Youth Leagues", "Garden Clubs", "Civic Organizations",
  ];
  return (
    <section style={{ textAlign: "center", padding: "0 2rem 4.5rem" }}>
      <p style={{ color: "#3a3a3a", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 600 }}>
        Built for any nonprofit
      </p>
      <div style={{ display: "flex", gap: "0.55rem", justifyContent: "center", flexWrap: "wrap", maxWidth: "700px", margin: "0 auto" }}>
        {orgs.map((label) => (
          <span key={label} style={{
            background: "#0e0e0e", border: "1px solid #1e1e1e",
            borderRadius: "999px", padding: "0.35rem 0.9rem",
            fontSize: "0.82rem", color: "#666",
          }}>{label}</span>
        ))}
      </div>
    </section>
  );
}

/* ─── Dashboard Mockup ─────────────────────────────────────────────── */

function DashboardMockup() {
  return (
    <section style={{ padding: "0 2rem 6rem", maxWidth: "960px", margin: "0 auto" }}>
      {/* Browser chrome */}
      <div style={{
        borderRadius: "16px", border: "1px solid #1e1e1e",
        overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        background: "#0e0e0e",
      }}>
        {/* Title bar */}
        <div style={{
          background: "#141414", padding: "0.75rem 1rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          borderBottom: "1px solid #1e1e1e",
        }}>
          <div style={{ display: "flex", gap: "0.45rem" }}>
            {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
              <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: "#1a1a1a", borderRadius: "6px",
            padding: "0.3rem 0.75rem", fontSize: "0.75rem", color: "#444",
            maxWidth: "320px", margin: "0 auto",
          }}>
            elks-672.orghub.app
          </div>
        </div>

        {/* Mock portal UI */}
        <div style={{ display: "flex", minHeight: "380px" }}>
          {/* Sidebar */}
          <div style={{
            width: "180px", background: "#0a0a0a", borderRight: "1px solid #191919",
            padding: "1.25rem 0", flexShrink: 0,
          }}>
            <div style={{ padding: "0 1rem 1.25rem", borderBottom: "1px solid #191919", marginBottom: "0.75rem" }}>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#f0f0f0" }}>Pasadena Elks</div>
              <div style={{ fontSize: "0.7rem", color: "#3b82f6", marginTop: "2px" }}>Lodge #672</div>
            </div>
            {[
              { label: "Dashboard", active: true },
              { label: "Events" },
              { label: "Members" },
              { label: "Committees" },
              { label: "Newsletters" },
              { label: "Messages" },
            ].map(({ label, active }) => (
              <div key={label} style={{
                padding: "0.55rem 1rem", fontSize: "0.8rem",
                color: active ? "#f0f0f0" : "#4a4a4a",
                background: active ? "#1a2a3a" : "transparent",
                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
                fontWeight: active ? 600 : 400,
              }}>{label}</div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: "1.5rem", background: "#0d0d0d" }}>
            <div style={{ fontSize: "0.7rem", color: "#555", marginBottom: "0.4rem" }}>Good evening</div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.25rem" }}>Welcome back, Dave</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Members", value: "247" },
                { label: "Upcoming Events", value: "6" },
                { label: "Active Committees", value: "4" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "#111", border: "1px solid #1e1e1e", borderRadius: "10px",
                  padding: "0.9rem 1rem",
                }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f0f0f0" }}>{value}</div>
                  <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "2px" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>Upcoming Events</div>
            {[
              { title: "Monthly Meeting", date: "Mar 5", loc: "Main Lodge Hall" },
              { title: "Hoop Shoot Finals", date: "Mar 12", loc: "Gym" },
              { title: "Scholarship Dinner", date: "Mar 21", loc: "Banquet Room" },
            ].map(({ title, date, loc }) => (
              <div key={title} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px",
                padding: "0.6rem 0.9rem", marginBottom: "0.4rem",
              }}>
                <div style={{ background: "#1d2d3d", color: "#60a5fa", borderRadius: "6px", padding: "0.25rem 0.5rem", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}>{date}</div>
                <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: "0.68rem", color: "#555" }}>{loc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#333", fontSize: "0.8rem", marginTop: "1.25rem" }}>
        Every organization gets a portal like this — fully branded with their own colors and logo.
      </p>
    </section>
  );
}

/* ─── Features ─────────────────────────────────────────────────────── */

function Features() {
  return (
    <section id="features" style={{ padding: "4rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
      <SectionLabel>Features</SectionLabel>
      <h2 style={sectionHeading}>Everything your org needs</h2>
      <p style={sectionSubtext}>All features included. Toggle only what makes sense for your organization.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.1rem" }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            background: "#0c0c0c", border: "1px solid #191919",
            borderRadius: "14px", padding: "1.5rem",
            transition: "border-color 0.2s",
          }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.95rem" }}>{f.title}</div>
            <div style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How it works ──────────────────────────────────────────────────── */

function HowItWorks({ appUrl }: { appUrl: string }) {
  const steps = [
    {
      n: "1",
      title: "Create your portal",
      desc: "Sign up in 60 seconds. Choose your org name and we generate a subdomain — no server setup, no configuration.",
    },
    {
      n: "2",
      title: "Customize your branding",
      desc: "Upload your logo, pick your colors, configure which features you need. Your portal, your look.",
    },
    {
      n: "3",
      title: "Invite your members",
      desc: "Send invite links, bulk-import from a CSV, or let members sign up directly. Assign roles instantly.",
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "5rem 2rem",
      borderTop: "1px solid #141414",
      borderBottom: "1px solid #141414",
      background: "#050505",
    }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
        <SectionLabel>How it works</SectionLabel>
        <h2 style={sectionHeading}>Up and running in minutes</h2>
        <p style={sectionSubtext}>No DevOps required. No annual contracts. Cancel anytime.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem", marginTop: "3.5rem", textAlign: "left" }}>
          {steps.map(({ n, title, desc }) => (
            <div key={n}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: "#0d1f33", border: "1px solid #1e3a5f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "1.1rem", color: "#3b82f6",
                marginBottom: "1rem",
              }}>{n}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</div>
              <div style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        <a href={`${appUrl}/register`} style={{ ...btnPrimary, display: "inline-block", marginTop: "3rem", padding: "0.9rem 2rem" }}>
          Create your portal now →
        </a>
      </div>
    </section>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────── */

function Pricing({ appUrl }: { appUrl: string }) {
  return (
    <section id="pricing" style={{ padding: "5rem 2rem", maxWidth: "960px", margin: "0 auto" }}>
      <SectionLabel>Pricing</SectionLabel>
      <h2 style={{ ...sectionHeading, textAlign: "center" }}>Simple, honest pricing</h2>
      <p style={{ ...sectionSubtext, textAlign: "center" }}>
        Free forever for small orgs who self-host. Managed hosting if you want zero maintenance.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem", marginTop: "3rem",
      }}>
        {PLANS.map((plan) => (
          <div key={plan.name} style={{
            background: plan.featured ? "#0b1c2e" : "#0c0c0c",
            border: `1px solid ${plan.featured ? "#2563eb" : "#191919"}`,
            borderRadius: "18px", padding: "2rem",
            position: "relative",
          }}>
            {plan.featured && (
              <div style={{
                position: "absolute", top: "-1px", left: "50%",
                transform: "translateX(-50%)",
                background: "#2563eb", color: "#fff", fontSize: "0.72rem",
                fontWeight: 700, padding: "0.25rem 1rem",
                borderRadius: "0 0 8px 8px", letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>Most popular</div>
            )}
            <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{plan.name}</div>
            <div style={{ marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em" }}>{plan.price}</span>
              <span style={{ fontSize: "0.9rem", color: "#555" }}>{plan.period}</span>
            </div>
            <div style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1.75rem", lineHeight: 1.5 }}>{plan.desc}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontSize: "0.875rem", color: "#888", display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "#3b82f6", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={plan.ctaUrl ?? `${appUrl}/register`}
              style={{
                display: "block", textAlign: "center",
                background: plan.featured ? "#2563eb" : "#131313",
                color: "#fff", padding: "0.8rem",
                borderRadius: "10px", fontWeight: 700,
                textDecoration: "none", fontSize: "0.95rem",
                border: plan.featured ? "none" : "1px solid #252525",
              }}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────── */

function Faq() {
  return (
    <section style={{
      padding: "4rem 2rem 5rem",
      borderTop: "1px solid #141414",
      background: "#050505",
    }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <SectionLabel>FAQ</SectionLabel>
        <h2 style={sectionHeading}>Common questions</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "2.5rem" }}>
          {FAQS.map(({ q, a }) => (
            <div key={q} style={{
              background: "#0c0c0c", border: "1px solid #191919",
              borderRadius: "12px", padding: "1.25rem 1.5rem",
            }}>
              <div style={{ fontWeight: 700, marginBottom: "0.6rem", fontSize: "0.95rem" }}>{q}</div>
              <div style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.65 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Closing CTA ───────────────────────────────────────────────────── */

function ClosingCta({ appUrl }: { appUrl: string }) {
  return (
    <section style={{
      padding: "6rem 2rem", textAlign: "center",
      borderTop: "1px solid #141414",
      background: "radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.15) 0%, transparent 70%)",
    }}>
      <div style={{ maxWidth: "620px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
          letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1,
        }}>
          Your org deserves better than a Facebook group.
        </h2>
        <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          Give your members a real home. Set up your portal in 60 seconds — free forever.
        </p>
        <a href={`${appUrl}/register`} style={{
          ...btnPrimary,
          padding: "1rem 2.5rem", fontSize: "1.1rem",
          display: "inline-block",
        }}>
          Get started free →
        </a>
        <p style={{ color: "#333", fontSize: "0.8rem", marginTop: "1.25rem" }}>
          No credit card · No lock-in · Open source
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #141414", padding: "2.5rem 2rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: "1rem",
    }}>
      <span style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.03em" }}>
        Org<span style={{ color: "#3b82f6" }}>Hub</span>
      </span>
      <p style={{ color: "#333", fontSize: "0.82rem", margin: 0 }}>
        MIT licensed · Built with Next.js + Supabase
      </p>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <a href="https://github.com/davewilsn05/orghub-platform" target="_blank" rel="noopener noreferrer" style={{ color: "#444", fontSize: "0.82rem", textDecoration: "none" }}>GitHub</a>
        <a href="#pricing" style={{ color: "#444", fontSize: "0.82rem", textDecoration: "none" }}>Pricing</a>
        <a href="#features" style={{ color: "#444", fontSize: "0.82rem", textDecoration: "none" }}>Features</a>
      </div>
    </footer>
  );
}

/* ─── Shared helpers ────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      textAlign: "center",
      fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.75rem",
    }}>
      {children}
    </div>
  );
}

const navLink: React.CSSProperties = {
  color: "#666", textDecoration: "none", fontSize: "0.88rem", fontWeight: 500,
};

const btnPrimary: React.CSSProperties = {
  background: "#2563eb", color: "#fff", padding: "0.55rem 1.1rem",
  borderRadius: "9px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
  display: "inline-block",
};

const sectionHeading: React.CSSProperties = {
  fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900,
  letterSpacing: "-0.03em", marginBottom: "0.75rem", lineHeight: 1.15,
  textAlign: "center",
};

const sectionSubtext: React.CSSProperties = {
  color: "#666", fontSize: "1rem", lineHeight: 1.6, marginBottom: "0",
  textAlign: "center",
};

/* ─── Data ──────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: "📅", title: "Events & RSVPs", desc: "Event pages with RSVP tracking, ICS calendar downloads, and a full calendar grid view." },
  { icon: "🏛️", title: "Committee Management", desc: "Committee pages with goals, membership rosters, meeting minutes, and dedicated calendars." },
  { icon: "📰", title: "Newsletters", desc: "Rich-text editor, draft/publish workflow, and one-click email blast to all active members." },
  { icon: "💬", title: "Internal Messaging", desc: "Inbox, sent, archive, and broadcast bulletins — all inside the portal, no email required." },
  { icon: "🙋", title: "Volunteer Hub", desc: "Volunteer shifts, signup management, and recognition for top contributors." },
  { icon: "📹", title: "Zoom Meetings", desc: "Embedded Zoom SDK with secure JWT signatures so members join directly from the portal." },
  { icon: "👥", title: "Member Directory", desc: "Searchable directory with privacy controls, role badges, and profile pages." },
  { icon: "🎨", title: "Per-org Branding", desc: "Custom colors, logo, and favicon — every organization's portal looks uniquely theirs." },
  { icon: "🔒", title: "Role-based Access", desc: "Admin, board/council, committee chair, and member tiers with scoped permissions." },
  { icon: "🌐", title: "Custom Domains", desc: "Each org gets a subdomain out of the box. Bring your own domain on the managed plan." },
  { icon: "📂", title: "Document Library", desc: "Bylaws, annual reports, health & safety files — organized and access-controlled per org." },
  { icon: "📊", title: "Admin Dashboard", desc: "Member management, event oversight, polls, announcements, and org-wide settings." },
];

const PLANS = [
  {
    name: "Self-hosted",
    price: "Free",
    period: " forever",
    desc: "Run OrgHub on your own Supabase project and server.",
    featured: false,
    cta: "Get the code",
    ctaUrl: "https://github.com/davewilsn05/orghub-platform",
    features: [
      "Unlimited members",
      "All features included",
      "Your own Supabase project",
      "MIT licensed",
      "Community support",
    ],
  },
  {
    name: "Managed",
    price: "$49",
    period: "/mo per org",
    desc: "We run it. You focus on your members.",
    featured: true,
    cta: "Start free trial →",
    ctaUrl: null,
    features: [
      "Subdomain included",
      "Managed Supabase + backups",
      "Email via SendGrid",
      "Automatic updates",
      "Priority support",
    ],
  },
  {
    name: "Network",
    price: "Custom",
    period: "",
    desc: "Multiple chapters or lodges under one umbrella.",
    featured: false,
    cta: "Contact us",
    ctaUrl: "mailto:hello@orghub.app",
    features: [
      "Unlimited orgs",
      "Centralized admin",
      "Shared member pool",
      "Custom domain",
      "Dedicated support",
    ],
  },
];

const FAQS = [
  {
    q: "How is this different from a generic website builder?",
    a: "OrgHub is purpose-built for member-based organizations. It ships with RSVPs, member roles, committees, newsletters, messaging, and volunteer management out of the box — not as plugins or add-ons.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Every org gets a free subdomain (your-org.orghub.app). On the Managed plan you can point any custom domain to your portal.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You can export your full database at any time. If you're on the self-hosted plan, you already own the data — it lives in your Supabase project.",
  },
  {
    q: "Do members need to pay anything?",
    a: "No. Members access the portal for free. Only the organization admin pays for hosting (or self-hosts for free).",
  },
  {
    q: "Is it really open source?",
    a: "Yes, 100% MIT licensed. Fork it, modify it, self-host it. The entire codebase is on GitHub.",
  },
];
