import type { Metadata } from "next";
import Link from "next/link";
import { NewTechnicianForm } from "./new-technician-form";

export const metadata: Metadata = { title: "Novo Técnico — ServiceFlow" };

export default function NewTechnicianPage() {
  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link
        href="/team"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Equipes
      </Link>
      <h1 className="mb-7 mt-3 text-[28px] font-semibold leading-9 tracking-tight text-ink">
        Novo técnico
      </h1>
      <NewTechnicianForm />
    </main>
  );
}
