import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <AppHeader name={user.name} role={user.role} />
      {children}
    </div>
  );
}
