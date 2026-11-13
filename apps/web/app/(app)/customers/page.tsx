import Link from "next/link";
import { Suspense } from "react";
import { CustomerSearch } from "./customer-search";
import { CustomersTable, type CustomerRow } from "./customers-table";
import { Pagination } from "./pagination";
import { customers } from "./actions";

type SearchParams = Promise<{ search?: string; page?: string }>;

// TEMPORÁRIO: dados de exemplo só para ver a tela. Apague quando ligar na API.
const mock: CustomerRow[] = [
  { id: "1", name: "Ana Souza", phone: "19999990000", email: "ana@email.com" },
  {
    id: "2",
    name: "Maria Lima",
    phone: "19988881122",
    email: "maria.lima@email.com",
  },
  { id: "3", name: "Pedro Alves", phone: "11977773344", email: null },
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const customersList = await customers();
  console.log(customersList);
  return (
    <main className="mx-auto max-w-295 px-8 py-10 md:px-12">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
          Clientes
        </h1>
        <Link
          href="/customers/new"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Novo cliente
        </Link>
      </header>

      {/* ler searchParams (dado da URL) precisa ficar dentro do Suspense */}
      <Suspense fallback={<ListSkeleton />}>
        <CustomersContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CustomersContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  // TODO 1: buscar os clientes na API usando `search` e `pageNumber`
  const customers = mock;
  const hasMore = false;

  // TODO 2: montar os links de paginação, mantendo o termo da busca na URL
  const previousHref = undefined;
  const nextHref = undefined;

  return (
    <>
      <CustomerSearch defaultValue={search} />
      <CustomersTable customers={customers} search={search} />
      <Pagination
        page={pageNumber}
        previousHref={previousHref}
        nextHref={hasMore ? nextHref : undefined}
      />
    </>
  );
}

function ListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando clientes"
      className="space-y-3"
    >
      <div className="h-11 w-full max-w-sm rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="h-64 rounded-xl bg-border motion-safe:animate-pulse" />
    </div>
  );
}
