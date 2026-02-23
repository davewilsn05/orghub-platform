import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
  style?: React.CSSProperties;
}

const COLOR_MAP: Record<NonNullable<BadgeProps["color"]>, { bg: string; color: string }> = {
  blue: { bg: "#dbeafe", color: "#1d4ed8" },
  green: { bg: "#dcfce7", color: "#15803d" },
  yellow: { bg: "#fef9c3", color: "#a16207" },
  red: { bg: "#fee2e2", color: "#b91c1c" },
  gray: { bg: "#f3f4f6", color: "#4b5563" },
};

export function Badge({ children, color = "blue", style }: BadgeProps) {
  const { bg, color: textColor } = COLOR_MAP[color];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: bg,
        color: textColor,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
