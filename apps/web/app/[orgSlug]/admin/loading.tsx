export default function AdminLoading() {
  return (
    <div style={{ padding: "2rem", animation: "pulse 1.5s ease-in-out infinite" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .skel { background: #e5e7eb; borderRadius: 6px; }
      `}</style>

      {/* Page header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <div>
          <div className="skel" style={{ width: "160px", height: "28px", marginBottom: "8px", borderRadius: "6px", background: "#e5e7eb" }} />
          <div className="skel" style={{ width: "100px", height: "16px", borderRadius: "6px", background: "#e5e7eb" }} />
        </div>
        <div className="skel" style={{ width: "120px", height: "38px", borderRadius: "8px", background: "#e5e7eb" }} />
      </div>

      {/* Table skeleton */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "flex", gap: "1rem", padding: "0.75rem 1rem", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
          {[180, 140, 100, 80, 70].map((w, i) => (
            <div key={i} style={{ width: `${w}px`, height: "14px", borderRadius: "4px", background: "#e5e7eb" }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.875rem 1rem", borderBottom: "1px solid #f9fafb" }}>
            {[180, 140, 100, 80, 70].map((w, j) => (
              <div key={j} style={{ width: `${w}px`, height: "16px", borderRadius: "4px", background: "#f3f4f6" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
