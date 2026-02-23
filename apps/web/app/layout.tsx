import type { Metadata } from "next";
import { loadOrgConfig } from "@/lib/org/loader";
import { buildOrgCssVars } from "@orghub/config";
import type { CSSProperties } from "react";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const org = await loadOrgConfig();
  return {
    title: { default: org.name, template: `%s | ${org.name}` },
    description: org.tagline ?? `${org.name} member portal`,
    icons: { icon: org.branding.faviconUrl ?? "/favicon.ico" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await loadOrgConfig();
  const cssVars = buildOrgCssVars(org);

  return (
    <html lang="en" style={cssVars as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
