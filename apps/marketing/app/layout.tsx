import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrgHub — Member portal platform for nonprofits",
  description:
    "Events, committees, newsletters, messaging, and volunteer management — open source and self-hostable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
