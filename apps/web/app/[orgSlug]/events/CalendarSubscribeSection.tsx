"use client";

import { useCallback, useState } from "react";

export function CalendarSubscribeSection({ orgSlug }: { orgSlug: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const feedPath = `/api/orgs/${orgSlug}/calendar/feed`;

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}${feedPath}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [feedPath]);

  return (
    <div
      style={{
        margin: "0 0 2rem",
        padding: "12px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#f9fafb",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.95rem",
          padding: 0,
          color: "inherit",
        }}
      >
        {open ? "▾" : "▸"} Subscribe to Calendar
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#6b7280",
              fontSize: "0.9rem",
            }}
          >
            Add all upcoming events to your calendar app. Events update
            automatically.
          </p>
          <a
            href={feedPath.replace(/^\//, "webcal://" + (typeof window !== "undefined" ? window.location.host + "/" : ""))}
            style={{
              display: "inline-block",
              marginBottom: 8,
              background: "var(--org-primary, #3b82f6)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open in Calendar App
          </a>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              readOnly
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}${feedPath}`
                  : feedPath
              }
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: copied ? "#059669" : "#f3f4f6",
                color: copied ? "#fff" : "inherit",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "0.8rem",
              color: "#9ca3af",
            }}
          >
            For Google Calendar: Settings &rarr; Add calendar &rarr; From URL
            &rarr; paste the URL above.
          </p>
        </div>
      )}
    </div>
  );
}
