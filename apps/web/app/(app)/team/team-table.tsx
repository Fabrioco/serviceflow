import Link from "next/link";
import { Technician } from "./page";
import { formatDate } from "@/lib/format";

export function TeamTable({
  technicians,
  search,
}: {
  technicians: Technician[];
  search?: string;
}) {
  if (technicians.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
        <p className="text-[15px] text-ink">
          {search
            ? `Nenhum técnico encontrado para “${search}”.`
            : "Você ainda não tem técnicos."}
        </p>
        {!search && (
          <Link
            href="/team/new"
            className="mt-3 inline-block text-[15px] font-medium text-accent hover:underline"
          >
            Cadastrar o primeiro técnico
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(17,24,39,0.06)]">
      <table className="w-full min-w-150 text-left text-[15px]">
        <thead className="border-b border-border text-[13px] text-muted">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">
              Nome
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              E-mail
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Cadastro
            </th>
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {technicians.map((t) => (
            <tr key={t.id}>
              <td className="px-5 py-3.5 font-semibold text-ink">{t.name}</td>
              <td className="px-5 py-3.5 text-muted">{t.email ?? "—"}</td>
              <td className="px-5 py-3.5 text-muted">
                {formatDate(t.createdAt) ?? "-"}
              </td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={`/team/${t.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  Editar<span className="sr-only">, {t.name}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
