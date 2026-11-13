import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { SESSION_COOKIE } from "@/lib/session";
import { CustomerForm, type CustomerData } from "./customer-form";
import { DeleteCustomerSection } from "./delete-customer-section";
import { deleteCustomerAction, editCustomerAction } from "./actions";

type Params = Promise<{ id: string }>;

export default function CustomerPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link
        href="/customers"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Clientes
      </Link>
      <h1 className="mb-7 mt-3 text-[28px] font-semibold leading-9 tracking-tight text-ink">
        Editar cliente
      </h1>

      <Suspense fallback={<FormSkeleton />}>
        <CustomerContent params={params} />
      </Suspense>
    </main>
  );
}

async function CustomerContent({ params }: { params: Params }) {
  const { id } = await params;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}/customers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login");
  if (res.status === 404 || res.status === 400) notFound();
  if (!res.ok) throw new Error("Não foi possível carregar o cliente.");

  const customer: CustomerData = await res.json();

  return (
    <>
      <CustomerForm
        customer={customer}
        action={editCustomerAction.bind(null, customer.id)}
      />
      <DeleteCustomerSection
        action={deleteCustomerAction.bind(null, customer.id)}
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando cliente" className="space-y-5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-17 rounded-lg bg-border motion-safe:animate-pulse"
        />
      ))}
      <div className="h-24 rounded-lg bg-border motion-safe:animate-pulse" />
    </div>
  );
}
