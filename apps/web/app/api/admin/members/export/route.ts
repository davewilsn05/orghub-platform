import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await loadOrgConfig();
  const service = createServiceClient();

  const { data, error } = await service
    .from("profiles")
    .select("full_name, email, role, is_active, joined_at, created_at")
    .eq("org_id", org.id)
    .order("full_name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const headers = ["Name", "Email", "Role", "Status", "Joined"];
  const csvRows = [
    headers.join(","),
    ...rows.map((m) => {
      const joined = m.joined_at ?? m.created_at;
      return [
        csvEscape(m.full_name ?? ""),
        csvEscape(m.email),
        csvEscape(m.role),
        m.is_active ? "Active" : "Inactive",
        new Date(joined).toISOString().slice(0, 10),
      ].join(",");
    }),
  ];

  const csv = csvRows.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="members-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function csvEscape(val: string): string {
  if (/[",\r\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}
