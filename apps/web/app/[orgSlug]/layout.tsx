import { loadOrgConfig } from "@/lib/org/loader";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
};

export default async function OrgLayout({ children, params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();

  // If org doesn't exist in DB and slug doesn't match the default, 404
  if (!org.id && orgSlug !== "demo") {
    notFound();
  }

  return (
    <div data-org={orgSlug}>
      {children}
    </div>
  );
}
