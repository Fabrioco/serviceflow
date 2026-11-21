import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import { EditWorkOrderForm } from "./edit-work-order-form";

type Params = Promise<{ id: string }>;

export default async function EditWorkOrderPage({ params }: { params: Params }) {
  const { id } = await params;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}/work-orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Não foi possível carregar a ordem de serviço");

  const order = await res.json();

  const techniciansRes = await fetch(
    `${process.env.API_URL}/technicians?page=1&limit=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const techniciansJson: {
    data: Array<{ id: string; name: string }>;
  } = await techniciansRes.json();
  const technicians = techniciansJson.data ?? [];

  return (
    <main className="mx-auto max-w-2xl px-8 py-10 md:px-12">
      <Link
        href={`/work-orders/${id}`}
        className="inline-flex h-11 items-center rounded-lg px-4 text-[15px] font-medium text-muted hover:text-ink mb-6 block sm:inline-block"
      >
        ← OS #{order.id.slice(-4).toUpperCase()}
      </Link>
      <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink mb-8">
        Editar OS #{order.id.slice(-4).toUpperCase()}
      </h1>

      <p className="mb-6 rounded-lg border border-border bg-amber-50 p-3.5 text-sm text-amber-700">
        Só é possível editar ordens abertas ou agendadas. O cliente não pode ser
        trocado.
      </p>

      <EditWorkOrderForm
        order={{
          id: order.id,
          serviceName: order.serviceName,
          description: order.description,
          price: order.price,
          technicianId: order.technicianId,
          scheduledAt: order.scheduledAt,
          customerName: order.customer?.name ?? "—",
        }}
        technicians={technicians}
      />
    </main>
  );
}
