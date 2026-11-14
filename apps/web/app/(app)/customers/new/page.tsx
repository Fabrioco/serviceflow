import type { Metadata } from "next";
import Link from "next/link";
import { NewCustomerForm } from "./new-customer-form";

export const metadata: Metadata = { title: "Novo cliente — ServiceFlow" };

export default function NewCustomerPage() {
  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link href="/customers" className="text-sm font-medium text-accent hover:underline">
        ← Clientes
      </Link>
      <h1 className="mb-7 mt-3 text-[28px] font-semibold leading-9 tracking-tight text-ink">
        Novo cliente
      </h1>
      <NewCustomerForm />
    </main>
  );
}