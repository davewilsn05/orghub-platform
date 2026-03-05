"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLink = { href: string; label: string; icon: string };

type Props = {
  orgSlug: string;
  orgName: string;
  links: NavLink[];
};

export function AdminNav({ orgSlug, orgName, links }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    // Exact match for overview, prefix match for sub-pages
    if (href === `/${orgSlug}/admin`) return pathname === `/${orgSlug}/admin`;
    return pathname.startsWith(href);
  }

  const navContent = (
    <>
      <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", borderBottom: "1px solid #f3f4f6", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: "0.3rem" }}>
          Admin Panel
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{orgName}</div>
      </div>

      <nav style={{ flex: 1 }}>
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                padding: "0.6rem 1.25rem", fontSize: "0.875rem",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--org-primary, #3b82f6)" : "#374151",
                textDecoration: "none",
                background: active ? "var(--org-primary-bg, #eff6ff)" : "transparent",
                borderRight: `3px solid ${active ? "var(--org-primary, #3b82f6)" : "transparent"}`,
              }}
            >
              <span>{l.icon}</span>{l.label}
            </a>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
        <a href={`/${orgSlug}/dashboard`} style={{
          display: "flex", alignItems: "center", gap: "0.65rem",
          padding: "0.6rem 1.25rem", fontSize: "0.825rem",
          color: "#9ca3af", textDecoration: "none",
        }}>
          ← Back to portal
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle admin menu"
        style={{
          display: "none",
          position: "fixed", top: "64px", left: "0.75rem", zIndex: 100,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px",
          padding: "0.4rem 0.65rem", cursor: "pointer", fontSize: "1.1rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
        className="admin-hamburger"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: "none",
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 90,
          }}
          className="admin-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${mobileOpen ? " open" : ""}`}
        style={{
          width: "216px", flexShrink: 0,
          background: "#fff", borderRight: "1px solid #e5e7eb",
          padding: "1.5rem 0", display: "flex", flexDirection: "column",
        }}
      >
        {navContent}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .admin-hamburger { display: flex !important; align-items: center; }
          .admin-backdrop { display: block !important; }
          .admin-sidebar {
            position: fixed !important;
            top: 56px; left: 0; bottom: 0;
            z-index: 95;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            overflow-y: auto;
          }
          .admin-sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
