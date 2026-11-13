import Link from "next/link";
import { formatPhone } from "@/lib/format";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export function CustomersTable({
  customers,
  search,
}: {
  customers: CustomerRow[];
  search?: string;
}) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
        <p className="text-[15px] text-ink">
          {search
            ? `Nenhum cliente encontrado para “${search}”.`
            : "Você ainda não tem clientes."}
        </p>
        {!search && (
          <Link
            href="/customers/new"
            className="mt-3 inline-block text-[15px] font-medium text-accent hover:underline"
          >
            Cadastrar o primeiro cliente
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
              Telefone
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              E-mail
            </th>
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3.5 font-semibold text-ink">{c.name}</td>
              <td className="px-5 py-3.5 text-ink">{formatPhone(c.phone)}</td>
              <td className="px-5 py-3.5 text-muted">{c.email ?? "—"}</td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  href={`/customers/${c.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  Editar<span className="sr-only">, {c.name}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
