"use client";

import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

type Props = {
  orgSlug: string;
  navLinks: NavLink[];
  isAdmin: boolean;
};

export function MemberNav({ orgSlug, navLinks, isAdmin }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
      {isAdmin && (
        <a
          href={`/${orgSlug}/admin`}
          style={{
            padding: "0.4rem 0.75rem", borderRadius: "6px",
            fontSize: "0.875rem", fontWeight: 600,
            color: "var(--org-primary, #3b82f6)", textDecoration: "none",
          }}
        >
          Admin
        </a>
      )}
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: active ? 700 : 500,
              color: active ? "var(--org-primary, #3b82f6)" : "#374151",
              textDecoration: "none",
              background: active ? "var(--org-primary-bg, #eff6ff)" : "transparent",
            }}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
