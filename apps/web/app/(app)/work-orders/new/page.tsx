import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { NewWorkOrderForm } from "./new-work-order-form";

async function fetchCustomers(): Promise<Array<{ id: string; name: string; phone: string }>> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const res = await fetch(`${process.env.API_URL}/customers?page=1&limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json: { data: Array<{ id: string; name: string; phone: string }> } = await res.json();
  return json.data;
}

async function fetchTechnicians(): Promise<Array<{ id: string; name: string }>> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const res = await fetch(`${process.env.API_URL}/technicians?page=1&limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json: { data: Array<{ id: string; name: string }> } = await res.json();
  return json.data;
}

export default async function NewWorkOrderPage() {
  const [customers, technicians] = await Promise.all([
    fetchCustomers(),
    fetchTechnicians(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-8 py-10 md:px-12">
      <Link
        href="/work-orders"
        className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink mb-6 block sm:inline-block"
      >
        ← Ordens de serviço
      </Link>
      <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink mb-8">
        Nova ordem de serviço
      </h1>

      <NewWorkOrderForm customers={customers} technicians={technicians} />
    </main>
  );
}
