import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "../actions";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="text-[28px] font-semibold leading-9 text-ink">
        Olá, {user.name}
      </h1>
      <p className="mt-2 text-muted">Seu papel: {user.role}</p>
      <form action={logoutAction} className="mt-8">
        <Button variant="secondary">Sair</Button>
      </form>
    </main>
  );
}
