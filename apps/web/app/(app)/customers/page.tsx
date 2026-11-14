import Link from "next/link";
import { Suspense } from "react";
import { CustomerSearch } from "./customer-search";
import { CustomersTable, type CustomerRow } from "./customers-table";
import { Pagination } from "./pagination";
import { Customer, fetchCustomers } from "./actions";

type SearchParams = Promise<{ search?: string; page?: string }>;

type fetchCustomersResponse = {
  data: Customer[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
  const res: fetchCustomersResponse = await fetchCustomers();
  const customers = res.data;
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
