import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { SESSION_COOKIE } from "@/lib/session";
import { TechnicianForm, type TechnicianData } from "./technician-form";
import { DeleteTechnicianSection } from "./delete-technician-section";
import { deleteTechnicianAction, editTechnicianAction } from "./actions";

type Params = Promise<{ id: string }>;

export default function TechnicianPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link
        href="/team"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Técnicos
      </Link>

      <h1 className="mb-7 mt-3 text-[28px] font-semibold leading-9 tracking-tight text-ink">
        Editar técnico
      </h1>

      <Suspense fallback={<FormSkeleton />}>
        <TechnicianContent params={params} />
      </Suspense>
    </main>
  );
}

async function TechnicianContent({ params }: { params: Params }) {
  const { id } = await params;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}/technicians/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login");
  if (res.status === 404 || res.status === 400) notFound();

  if (!res.ok) {
    throw new Error("Não foi possível carregar o técnico.");
  }

  const technician: TechnicianData = await res.json();

  return (
    <>
      <TechnicianForm
        technician={technician}
        action={editTechnicianAction.bind(null, technician.id)}
      />

      <DeleteTechnicianSection
        action={deleteTechnicianAction.bind(null, technician.id)}
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando técnico" className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-17 rounded-lg bg-border motion-safe:animate-pulse"
        />
      ))}

      <div className="h-24 rounded-lg bg-border motion-safe:animate-pulse" />
    </div>
  );
}
