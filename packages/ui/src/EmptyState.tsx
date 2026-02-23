import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 2rem",
        color: "#6b7280",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#111827", marginBottom: "0.5rem" }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: "0.875rem", marginBottom: action ? "1.5rem" : 0 }}>
          {description}
        </div>
      )}
      {action}
    </div>
  );
}
