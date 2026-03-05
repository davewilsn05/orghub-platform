import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Ticket Orders — Admin" };

type Order = {
  id: string;
  buyer_email: string;
  quantity: number;
  amount_cents: number;
  status: string;
  created_at: string;
  event_title: string | null;
  ticket_name: string | null;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1fae5", color: "#065f46" },
  pending: { bg: "#fef9c3", color: "#92400e" },
  refunded: { bg: "#e0e7ff", color: "#3730a3" },
  canceled: { bg: "#f3f4f6", color: "#9ca3af" },
};

export default async function AdminOrdersPage() {
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("event_ticket_orders")
    .select(`
      id, buyer_email, quantity, amount_cents, status, created_at,
      events ( title ),
      event_ticket_types ( name )
    `)
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(500);

  type RawOrder = {
    id: string;
    buyer_email: string;
    quantity: number;
    amount_cents: number;
    status: string;
    created_at: string;
    events: { title: string } | null;
    event_ticket_types: { name: string } | null;
  };

  const orders: Order[] = ((data as RawOrder[] | null) ?? []).map((o) => ({
    id: o.id,
    buyer_email: o.buyer_email,
    quantity: o.quantity,
    amount_cents: o.amount_cents,
    status: o.status,
    created_at: o.created_at,
    event_title: o.events?.title ?? null,
    ticket_name: o.event_ticket_types?.name ?? null,
  }));

  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amount_cents, 0);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Ticket Orders</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {orders.length === 500 ? "500+" : orders.length} orders · ${(totalRevenue / 100).toFixed(2)} collected
            {orders.length === 500 && <span style={{ color: "#d97706", marginLeft: "0.4rem" }}>(showing first 500)</span>}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
          color: "#9ca3af",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎟️</div>
          <p style={{ fontWeight: 600 }}>No ticket orders yet</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["Event", "Ticket", "Buyer", "Qty", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{
                    padding: "0.75rem 1rem", textAlign: "left",
                    fontWeight: 600, color: "#6b7280", fontSize: "0.78rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const statusStyle = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>
                      {o.event_title ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>
                      {o.ticket_name ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>
                      {o.buyer_email}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center" }}>
                      {o.quantity}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>
                      ${(o.amount_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: statusStyle.bg, color: statusStyle.color,
                      }}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.82rem" }}>
                      {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
