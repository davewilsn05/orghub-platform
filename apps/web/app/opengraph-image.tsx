import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OrgHub — The member portal every nonprofit deserves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: "52px",
              letterSpacing: "-0.03em",
              color: "#f0f0f0",
            }}
          >
            Org
          </span>
          <span
            style={{
              fontWeight: 900,
              fontSize: "52px",
              letterSpacing: "-0.03em",
              color: "#3b82f6",
            }}
          >
            Hub
          </span>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#0d1f33",
            color: "#60a5fa",
            borderRadius: "999px",
            padding: "8px 20px",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            marginBottom: "28px",
            border: "1px solid #1e3a5f",
          }}
        >
          <div
            style={{
              background: "#3b82f6",
              borderRadius: "50%",
              width: "10px",
              height: "10px",
              display: "flex",
            }}
          />
          Open source · Self-hostable
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: "#f0f0f0",
              lineHeight: 1.05,
            }}
          >
            The member portal
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: "#3b82f6",
              lineHeight: 1.05,
            }}
          >
            every nonprofit deserves
          </span>
        </div>

        {/* Subtext */}
        <p
          style={{
            fontSize: "26px",
            color: "#6b7280",
            maxWidth: "760px",
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Events, committees, newsletters, messaging — plus an AI admin assistant.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "900px",
          }}
        >
          {["Events & RSVPs", "Committees", "Newsletters", "AI Assistant", "Member Directory", "Stripe Payments"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "#0e0e0e",
                  border: "1px solid #1e1e1e",
                  borderRadius: "999px",
                  padding: "8px 18px",
                  fontSize: "18px",
                  color: "#555",
                  display: "flex",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
