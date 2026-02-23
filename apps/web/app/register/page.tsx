import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create your portal — OrgHub" };

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#f5f5f5",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <a href="/" style={{ textDecoration: "none", marginBottom: "2.5rem" }}>
        <span style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#f5f5f5" }}>
          Org<span style={{ color: "#3b82f6" }}>Hub</span>
        </span>
      </a>

      {/* Card */}
      <div style={{
        background: "#fff",
        color: "#111827",
        borderRadius: "20px",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}>
        <RegisterForm />
      </div>

      <p style={{ marginTop: "1.5rem", color: "#555", fontSize: "0.85rem" }}>
        Already have a portal?{" "}
        <a href="/" style={{ color: "#3b82f6" }}>Sign in</a>
      </p>
    </div>
  );
}
