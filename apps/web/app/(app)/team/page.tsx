import Link from "next/link";
import { fetchTechnicians } from "./actions";
import { TeamTable } from "./team-table";
import { TeamSearch } from "./team-search";
import { Pagination } from "../customers/pagination";
import { Suspense } from "react";

type SearchParams = Promise<{ search?: string; page?: string }>;

export type Technician = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type MetaResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type FetchTechniciansResponse = {
  data: Technician[];
  meta: MetaResponse;
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-295 px-8 py-10 md:px-12">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
          Técnicos
        </h1>
        <Link
          href="/team/new"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Novo Técnico
        </Link>
      </header>

      <Suspense fallback={<ListSkeleton />}>
        <TeamContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function TeamContent({ searchParams }: { searchParams: SearchParams }) {
  const { search, page } = await searchParams;

  const pageNumber = Math.max(1, Number(page) || 1);
  const limit = 10;

  const res: FetchTechniciansResponse = await fetchTechnicians({
    search,
    page: pageNumber,
    limit,
  });

  const technicians = res.data;
  const { totalPages } = res.meta;

  function getPageHref(targetPage: number) {
    const params = new URLSearchParams();

    if (search?.trim()) {
      params.set("search", search.trim());
    }

    params.set("page", String(targetPage));

    return `/team?${params.toString()}`;
  }

  return (
    <>
      <TeamSearch defaultValue={search} />

      <TeamTable technicians={technicians} search={search} />

      <Pagination
        page={pageNumber}
        previousHref={pageNumber > 1 ? getPageHref(pageNumber - 1) : undefined}
        nextHref={
          pageNumber < totalPages ? getPageHref(pageNumber + 1) : undefined
        }
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
