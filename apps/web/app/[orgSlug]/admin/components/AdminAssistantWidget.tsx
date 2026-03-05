"use client";

import { useState } from "react";
import AssistantChat from "./AssistantChat";

type Props = { orgName: string; orgSlug: string };

export default function AdminAssistantWidget({ orgName, orgSlug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1000,
      }}
    >
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "3.75rem",
            right: 0,
            width: "min(420px, calc(100vw - 2rem))",
            height: "min(560px, calc(100vh - 8rem))",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              background: "#fafafa",
            }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                ✦ Assistant
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  marginLeft: "0.5rem",
                }}
              >
                Admin only
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                fontSize: "1rem",
                padding: "0 0.25rem",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              padding: "0 0.5rem 0.5rem",
            }}
          >
            <AssistantChat orgName={orgName} orgSlug={orgSlug} widgetMode />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI Assistant"
        style={{
          background: "#1d4ed8",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          padding: "0.65rem 1.15rem",
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span>✦</span>
        {open ? "Close" : "Assistant"}
      </button>
    </div>
  );
}
