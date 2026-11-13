import Link from "next/link";

type PaginationProps = {
  page: number;
  previousHref?: string;
  nextHref?: string;
};

export function Pagination({ page, previousHref, nextHref }: PaginationProps) {
  if (!previousHref && !nextHref) return null;

  return (
    <nav
      aria-label="Paginação"
      className="mt-6 flex items-center justify-between text-sm"
    >
      {previousHref ? (
        <Link
          href={previousHref}
          className="font-medium text-accent hover:underline"
        >
          ← Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted">Página {page}</span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="font-medium text-accent hover:underline"
        >
          Próxima →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
